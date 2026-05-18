import 'package:flutter/material.dart';
import 'package:sharek_app_full/main_layaut.dart';
import 'splash_auth.dart';
import 'main_layout.dart';
import 'cart_page.dart';
import 'request_page.dart';
import 'add_item_page.dart';

void main() {
  runApp(const SharekApp());
}

class SharekApp extends StatelessWidget {
  const SharekApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sharek App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color.fromARGB(255, 45, 43, 88),
        scaffoldBackgroundColor: const Color.fromARGB(255, 45, 43, 88),
        brightness: Brightness.dark,
        useMaterial3: true,
      ),
      // نقطة البداية
      home: const SplashScreen(),
      
      // تعريف المسارات للصفحات اللي مش محتاجة داتا وهي بتفتح
      routes: {
        '/auth': (context) => const AuthScreen(),
        '/home': (context) => const MainLayout(),
        '/cart': (context) => const CartPage(),
        '/request': (context) => const RequestPage(),
        '/add_item': (context) => const AddNewItemPage(),
      },
    );
  }
}