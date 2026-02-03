# Transaction Thread Propagation in Exposed

이 문서는 Exposed ORM에서 트랜잭션이 스레드 간에 어떻게 전파되는지 설명한다.

## 개요

Exposed는 코루틴 환경에서 트랜잭션이 다른 스레드로 전환(thread hopping)될 때도 논리적으로 하나의 트랜잭션을 유지하기 위해 다음 메커니즘을 사용한다:

1. **`transactionId`** - UUID 기반 유일 식별자
2. **`ThreadLocalTransactionsStack`** - 스레드별 트랜잭션 스택 관리
3. **`TransactionContextElement`** - 코루틴 스레드 전환 시 자동 push/pop

---

## 핵심 컴포넌트

### 1. Transaction ID (유일 식별자)

```kotlin
// Transaction.kt
abstract class Transaction : UserDataHolder(), TransactionInterface {
    val transactionId by lazy { UUID.randomUUID().toString() }
}
```

- 각 트랜잭션은 **UUID 기반의 고유 식별자**를 가짐
- `lazy`로 선언되어 처음 접근 시 한 번만 생성
- 이 ID가 논리적으로 "하나의 트랜잭션"을 구분하는 핵심 키

### 2. ThreadLocalTransactionsStack

```kotlin
// ThreadLocalTransactionsStack.kt
object ThreadLocalTransactionsStack {
    private val transactions = ThreadLocal<Stack<Transaction>>()

    fun pushTransaction(transaction: Transaction) {
        transactions.getOrSet { Stack() }.push(transaction)
    }

    fun popTransaction(): Transaction {
        val stack = transactions.get()
        require(stack != null && stack.isNotEmpty()) { "No transaction to pop" }
        val result = stack.pop()
        if (stack.isEmpty()) {
            transactions.remove()  // 메모리 누수 방지
        }
        return result
    }

    fun getTransactionOrNull(): Transaction? {
        val stack = transactions.get() ?: return null
        return if (stack.isEmpty()) null else stack.peek()
    }
}
```

**특징:**
- 각 스레드가 **독립적인 트랜잭션 스택**을 가짐
- 스레드 간 전파 시 **명시적으로 push/pop** 필요
- 스택이 비면 자동으로 ThreadLocal 정리 (메모리 누수 방지)

### 3. TransactionContextElement

코루틴의 `ThreadContextElement`를 구현하여 스레드 전환 시 자동으로 ThreadLocal을 관리한다.

```kotlin
// TransactionContextElement.kt
class TransactionContextElement(
    private val transaction: Transaction
) : ThreadContextElement<Transaction?>, AbstractCoroutineContextElement(TransactionContextElement) {

    companion object Key : CoroutineContext.Key<TransactionContextElement>

    override fun updateThreadContext(context: CoroutineContext): Transaction? {
        val previousTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()
        // transactionId로 동일 트랜잭션인지 확인 (중복 push 방지)
        if (previousTransaction?.transactionId == transaction.transactionId) return null

        ThreadLocalTransactionsStack.pushTransaction(transaction)
        return transaction
    }

    override fun restoreThreadContext(context: CoroutineContext, oldState: Transaction?) {
        if (oldState == null) return

        val currentTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()
        // transactionId 검증으로 스택 오염 방지
        if (currentTransaction?.transactionId != transaction.transactionId) {
            exposedLogger.warn("Stack corruption detected...")
            return
        }

        ThreadLocalTransactionsStack.popTransaction()
    }
}
```

---

## 트랜잭션 전파 흐름

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ suspendTransaction(db) { ... }                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ withTransactionContext(transaction) { block }                                   │
│   ↓                                                                             │
│   transaction.asContext() =                                                     │
│     TransactionContextHolderImpl(tx, key)  ← 코루틴 컨텍스트에 tx 참조 저장      │
│       +                                                                         │
│     TransactionContextElement(tx)          ← ThreadContextElement (push/pop)   │
│   ↓                                                                             │
│   withContext(context, block)              ← 코루틴 실행                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    ▼                       ▼
[Thread A - 시작]      [Thread B - 재개 (thread hopping)]
```

### 상세 흐름

#### Step 1: Thread A에서 코루틴 시작

```kotlin
// TransactionContextElement.updateThreadContext 호출
override fun updateThreadContext(context: CoroutineContext): Transaction? {
    val previousTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()
    
    // 이미 같은 트랜잭션이 스택에 있으면 skip (중복 방지)
    if (previousTransaction?.transactionId == transaction.transactionId) return null

    // ★ PUSH: 스레드 A의 ThreadLocal 스택에 트랜잭션 추가
    ThreadLocalTransactionsStack.pushTransaction(transaction)
    return transaction  // oldState로 저장 (나중에 pop할 때 사용)
}
```

**Thread A 상태:**
```
ThreadLocal<Stack<Transaction>>
  Thread A: [Tx-UUID-123]  ← pushed
```

#### Step 2: 코루틴 suspend (Thread A 떠남)

```kotlin
// TransactionContextElement.restoreThreadContext 호출
override fun restoreThreadContext(context: CoroutineContext, oldState: Transaction?) {
    if (oldState == null) return  // updateThreadContext에서 skip했으면 pop도 skip
    
    val currentTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()
    
    // transactionId로 무결성 검증
    if (currentTransaction?.transactionId != transaction.transactionId) {
        exposedLogger.warn("...")  // 스택 오염 감지
        return
    }

    // ★ POP: Thread A의 스택에서 트랜잭션 제거
    val poppedTransaction = ThreadLocalTransactionsStack.popTransaction()
}
```

**Thread A 상태:**
```
ThreadLocal<Stack<Transaction>>
  Thread A: []  ← popped, 비어있음
```

#### Step 3: Thread B에서 재개 (Thread Hopping)

```kotlin
// 다시 updateThreadContext 호출됨
override fun updateThreadContext(context: CoroutineContext): Transaction? {
    // Thread B의 스택은 비어있음 (다른 스레드)
    val previousTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()  // null
    
    // ★ PUSH: Thread B의 ThreadLocal 스택에 동일한 트랜잭션 추가
    ThreadLocalTransactionsStack.pushTransaction(transaction)  // 같은 Tx-UUID-123
    return transaction
}
```

**상태 변화:**
```
ThreadLocal<Stack<Transaction>>
  Thread A: []              ← 비어있음
  Thread B: [Tx-UUID-123]   ← 같은 트랜잭션이 새 스레드에 push됨
```

#### Step 4: 코루틴 완료

```kotlin
// restoreThreadContext 호출
override fun restoreThreadContext(context: CoroutineContext, oldState: Transaction?) {
    // ★ POP: Thread B에서 최종 정리
    ThreadLocalTransactionsStack.popTransaction()
}
```

---

## 시퀀스 다이어그램

```
Thread A                    CoroutineContext                 Thread B
   │                              │                              │
   │  ┌────────────────────────┐  │                              │
   │  │ TransactionContextElement │                              │
   │  │ (tx: Tx-UUID-123)      │  │                              │
   │  └────────────────────────┘  │                              │
   │                              │                              │
   ├──updateThreadContext()──────►│                              │
   │  push(Tx-UUID-123)           │                              │
   │                              │                              │
   │  [코루틴 실행 중...]          │                              │
   │                              │                              │
   │  [suspend point]             │                              │
   │◄──restoreThreadContext()─────│                              │
   │  pop(Tx-UUID-123)            │                              │
   │                              │                              │
   │                              │──updateThreadContext()──────►│
   │                              │  push(Tx-UUID-123)           │
   │                              │                              │
   │                              │  [코루틴 재개 및 실행...]     │
   │                              │                              │
   │                              │◄──restoreThreadContext()─────│
   │                              │  pop(Tx-UUID-123)            │
   │                              │                              │
```

---

## 동기 블록용: withThreadLocalTransaction

코루틴이 아닌 일반 블록에서도 같은 패턴을 사용한다:

```kotlin
// Transactions.kt
fun <T> withThreadLocalTransaction(transaction: Transaction?, block: () -> T): T {
    if (transaction == null) return block()

    // 중복 push 방지 (transactionId 비교)
    val currentTransaction = ThreadLocalTransactionsStack.getTransactionOrNull()
    if (currentTransaction?.transactionId == transaction.transactionId) {
        return block()  // 이미 스택에 있으면 그냥 실행
    }

    // ★ PUSH
    ThreadLocalTransactionsStack.pushTransaction(transaction)
    return try {
        block()
    } finally {
        // ★ POP
        ThreadLocalTransactionsStack.popTransaction()
    }
}
```

---

## Spring Integration (SpringTransactionManager)

Spring의 트랜잭션 라이프사이클과 연동:

```kotlin
// SpringTransactionManager.kt
class SpringTransactionManager(...) : AbstractPlatformTransactionManager() {

    override fun doBegin(transaction: Any, definition: TransactionDefinition) {
        // 새 트랜잭션 생성
        val newTransaction = trxObject.database.transactionManager.newTransaction(...)
        
        // ★ PUSH: ThreadLocal 스택에 추가
        ThreadLocalTransactionsStack.pushTransaction(newTransaction)
    }

    override fun doSuspend(transaction: Any): Any {
        // ★ POP: 트랜잭션 일시 중단 시 스택에서 제거
        ThreadLocalTransactionsStack.popTransaction()
        return SuspendedObject(transaction, connectionHolder)
    }

    override fun doResume(transaction: Any?, suspendedResources: Any) {
        val suspendedObject = suspendedResources as SuspendedObject
        // ★ PUSH: 재개 시 다시 스택에 추가
        ThreadLocalTransactionsStack.pushTransaction(suspendedObject.transaction)
    }

    override fun doCleanupAfterCompletion(transaction: Any) {
        // ★ POP: 완료 시 스택에서 제거
        ThreadLocalTransactionsStack.popTransaction()
    }
}
```

| Spring 메서드 | Exposed 동작 |
|--------------|--------------|
| `doBegin` | `pushTransaction(newTransaction)` |
| `doSuspend` | `popTransaction()` + Spring unbind |
| `doResume` | `pushTransaction(...)` + Spring rebind |
| `doCleanupAfterCompletion` | `popTransaction()` |

---

## 요약

### Push/Pop 발생 시점

| 시점 | 동작 | 코드 위치 |
|------|------|-----------|
| 코루틴 시작/재개 | `push(tx)` | `TransactionContextElement.updateThreadContext` |
| 코루틴 suspend/완료 | `pop()` | `TransactionContextElement.restoreThreadContext` |
| 동기 블록 진입 | `push(tx)` | `withThreadLocalTransaction` |
| 동기 블록 종료 | `pop()` | `withThreadLocalTransaction` finally |
| Spring 트랜잭션 시작 | `push(tx)` | `SpringTransactionManager.doBegin` |
| Spring 트랜잭션 일시중단 | `pop()` | `SpringTransactionManager.doSuspend` |
| Spring 트랜잭션 재개 | `push(tx)` | `SpringTransactionManager.doResume` |
| Spring 트랜잭션 정리 | `pop()` | `SpringTransactionManager.doCleanupAfterCompletion` |

### 핵심 포인트

1. **유일 식별자**: `Transaction.transactionId` (UUID)
   - 모든 push/pop에서 `transactionId`를 비교해 **논리적으로 같은 트랜잭션**임을 보장

2. **스레드 독립성**: 각 스레드는 자신만의 `ThreadLocal<Stack<Transaction>>`을 가짐
   - 스레드가 바뀌어도 같은 UUID를 가진 트랜잭션이 새 스레드의 ThreadLocal에 push됨

3. **중복 방지**: `transactionId` 비교로 이미 스택에 있는 트랜잭션은 다시 push하지 않음

4. **무결성 검증**: pop 전에 현재 스택 top의 `transactionId`가 예상과 일치하는지 확인

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `exposed-core/.../Transaction.kt` | `transactionId` 정의 |
| `exposed-core/.../ThreadLocalTransactionsStack.kt` | 스레드별 트랜잭션 스택 관리 |
| `exposed-core/.../suspend/TransactionContextElement.kt` | 코루틴 스레드 전환 시 자동 push/pop |
| `exposed-core/.../suspend/TransactionContextHolder.kt` | 코루틴 컨텍스트에 트랜잭션 참조 저장 |
| `exposed-core/.../Transactions.kt` | `withThreadLocalTransaction` |
| `exposed-jdbc/.../JdbcTransactionManager.kt` | `createTransactionContext` |
| `spring-transaction/.../SpringTransactionManager.kt` | Spring 연동 |
