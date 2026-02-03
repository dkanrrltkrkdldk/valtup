import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

// Production URL
const String kWebAppUrl = 'https://valtup-web-user.vercel.app';

// Local development URL (로컬 테스트용)
// iOS Simulator: localhost 사용
// Android Emulator: 10.0.2.2 사용
// const String kWebAppUrl = 'http://localhost:3000';
const Color kPrimaryColor = Color(0xFF6366F1);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const PointRouletteApp());
}

class PointRouletteApp extends StatelessWidget {
  const PointRouletteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Point Roulette',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: kPrimaryColor),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late WebViewController _controller;
  late StreamSubscription<ConnectivityResult> _connectivitySubscription;

  bool _isLoading = true;
  bool _hasError = false;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _initWebView();
    _initConnectivity();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => _onPageStarted(),
          onPageFinished: (_) => _onPageFinished(),
          onWebResourceError: (error) => _onWebResourceError(error),
          onHttpError: (error) => _onHttpError(error),
        ),
      )
      ..loadRequest(Uri.parse(kWebAppUrl));
  }

  void _initConnectivity() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((
      result,
    ) {
      final isOffline = result == ConnectivityResult.none;

      if (_isOffline && !isOffline) {
        _retry();
      }

      setState(() => _isOffline = isOffline);
    });
  }

  void _onPageStarted() {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });
  }

  void _onPageFinished() {
    setState(() => _isLoading = false);
  }

  void _onWebResourceError(WebResourceError error) {
    if (error.errorType == WebResourceErrorType.hostLookup ||
        error.errorType == WebResourceErrorType.connect ||
        error.errorType == WebResourceErrorType.timeout) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

  void _onHttpError(HttpResponseError error) {
    if (error.response?.statusCode != null &&
        error.response!.statusCode >= 500) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

  void _retry() {
    setState(() {
      _hasError = false;
      _isLoading = true;
    });
    _controller.loadRequest(Uri.parse(kWebAppUrl));
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (await _controller.canGoBack()) {
          _controller.goBack();
        }
      },
      child: Scaffold(
        backgroundColor: kPrimaryColor,
        body: SafeArea(child: _buildBody()),
      ),
    );
  }

  Widget _buildBody() {
    if (_hasError || _isOffline) {
      return _buildErrorScreen();
    }

    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading) _buildLoadingIndicator(),
      ],
    );
  }

  Widget _buildLoadingIndicator() {
    return Container(
      color: Colors.white,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: kPrimaryColor),
            SizedBox(height: 16),
            Text(
              '로딩 중...',
              style: TextStyle(
                color: kPrimaryColor,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isOffline ? Icons.wifi_off : Icons.error_outline,
              size: 80,
              color: kPrimaryColor.withOpacity(0.7),
            ),
            const SizedBox(height: 24),
            Text(
              _isOffline ? '네트워크 연결 없음' : '연결 오류',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _isOffline
                  ? '인터넷 연결을 확인해 주세요.'
                  : '서버에 연결할 수 없습니다.\n잠시 후 다시 시도해 주세요.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _isOffline ? null : _retry,
              style: ElevatedButton.styleFrom(
                backgroundColor: kPrimaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.refresh),
              label: const Text(
                '다시 시도',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
