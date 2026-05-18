import 'package:flutter/material.dart';

// 1. شكل المنتج الموحد في التطبيق كله
class Product {
  final String id;
  final String name;
  final String category;
  final double price;
  final String image;
  final double rating;
  final int reviews;
  final String description;

  Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.image,
    required this.rating,
    required this.reviews,
    required this.description,
  });
}

// 2. خدمة السلة (عشان تحفظ الحاجات اللي اخترناها)
class CartService {
  // بنعملها Singleton عشان تفضل محتفظة بالبيانات طول ما التطبيق شغال
  static final CartService _instance = CartService._internal();
  factory CartService() => _instance;
  CartService._internal();

  // قائمة الحاجات اللي في السلة
  final List<Product> cartItems = [];

  void addToCart(Product product) {
    cartItems.add(product);
  }

  void removeFromCart(Product product) {
    cartItems.remove(product);
  }

  void clearCart() {
    cartItems.clear();
  }

  double getTotalPrice() {
    return cartItems.fold(0, (sum, item) => sum + item.price);
  }
}

// 3. داتا المنتجات كلها (بدل ما نكتبها في كل صفحة)
final List<Product> allProducts = [
  Product(
    id: '1',
    name: 'Digital Laser Level',
    category: 'Engineering',
    price: 15.0,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800',
    description: 'High precision digital laser level for construction and engineering works.',
  ),
  Product(
    id: '2',
    name: 'Pro Paint Brush Set',
    category: 'Art Tools',
    price: 8.0,
    rating: 4.9,
    reviews: 18,
    image: 'https://www.sitaramstationers.com/wp-content/uploads/2020/07/flat-no.9.jpeg',
    description: 'Professional set of brushes for fine art painting. Includes various sizes.',
  ),
  Product(
    id: '3',
    name: 'Power Drill',
    category: 'Construction',
    price: 12.0,
    rating: 4.7,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
    description: 'Cordless power drill with long battery life.',
  ),
  Product(
    id: '4',
    name: 'Digital Multimeter',
    category: 'Engineering',
    price: 7.0,
    rating: 4.9,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    description: 'Essential tool for electrical engineering tasks.',
  ),
   Product(
    id: '5',
    name: '3D Printer',
    category: 'Design',
    price: 30.0,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400', // Placeholder
    description: 'High quality 3D printer for prototyping.',
  ),
];