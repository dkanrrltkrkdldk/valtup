import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  Badge,
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { AdminProductResponse, CreateProductRequest } from '@/types/api';

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductResponse | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<AdminProductResponse | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page],
    queryFn: () => adminApi.getProducts(page, 10),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModals();
      showSuccess('상품이 등록되었습니다');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || '상품 등록 중 오류가 발생했습니다');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProductRequest }) =>
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModals();
      showSuccess('상품이 수정되었습니다');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || '상품 수정 중 오류가 발생했습니다');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModals();
      showSuccess('상품이 삭제되었습니다');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || '상품 삭제 중 오류가 발생했습니다');
    },
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    setDeletingProduct(null);
    setFormData({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    setErrorMessage('');
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (product: AdminProductResponse) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
    });
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
        <Button onClick={openCreateModal}>상품 등록</Button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">상품 목록</h2>
        </CardHeader>
        <CardBody>
          {data?.content.length === 0 ? (
            <p className="text-center text-gray-500 py-8">등록된 상품이 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.content.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString()}P</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.deletedAt ? (
                        <Badge variant="danger">삭제됨</Badge>
                      ) : (
                        <Badge variant="success">판매중</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(product.createdAt)}</TableCell>
                    <TableCell>
                      {!product.deletedAt && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingProduct(product)}
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.totalPages > 0 && (
            <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={data.first}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {data.page + 1} / {data.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
              >
                다음
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="상품 등록"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <Input
            label="상품명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="가격 (P)"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="재고"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="이미지 URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModals}>
              취소
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              등록
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingProduct}
        onClose={closeModals}
        title="상품 수정"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Input
            label="상품명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="가격 (P)"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="재고"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="이미지 URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModals}>
              취소
            </Button>
            <Button type="submit" isLoading={updateMutation.isPending}>
              수정
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deletingProduct}
        onClose={closeModals}
        title="상품 삭제"
      >
        <p className="text-gray-600 mb-6">
          정말 <strong>{deletingProduct?.name}</strong>을(를) 삭제하시겠습니까?
        </p>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={closeModals}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  );
}
