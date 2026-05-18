import 'package:flutter/material.dart';
import 'app_data.dart'; // استيراد المخزن
import 'payment_page.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final cartService = CartService();

  @override
  Widget build(BuildContext context) {
    // حساب المجموع الحقيقي
    double subtotal = cartService.getTotalPrice();
    double serviceFee = 5.0; // رسوم ثابتة مثلا
    double total = subtotal + serviceFee;

    const Color mainColor = Color(0xFF2D2B58);

    return Scaffold(
      backgroundColor: mainColor,
      appBar: AppBar(
        title: Text('My Cart (${cartService.cartItems.length})', style: const TextStyle(color: Colors.white)),
        backgroundColor: mainColor,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: cartService.cartItems.isEmpty
          ? const Center(child: Text('Your cart is empty!', style: TextStyle(color: Colors.white, fontSize: 20)))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cartService.cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartService.cartItems[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                item.image,
                                width: 80, height: 80, fit: BoxFit.cover,
                                errorBuilder: (c,e,s) => Container(width:80, height:80, color:Colors.grey),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                  Text('\$${item.price}/day', style: const TextStyle(color: Colors.grey)),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.redAccent),
                              onPressed: () {
                                setState(() {
                                  cartService.removeFromCart(item);
                                });
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                
                // Total Section
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                  ),
                  child: Column(
                    children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Subtotal'),
                        Text('\$${subtotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ]),
                      const SizedBox(height: 10),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Service Fee'),
                        Text('\$${serviceFee.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ]),
                      const Divider(height: 30),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Total', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        Text('\$${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: mainColor)),
                      ]),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {
                            if (cartService.cartItems.isNotEmpty) {
                              // نبعت السعر النهائي لصفحة الدفع
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PaymentPage(totalAmount: total),
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: mainColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Proceed to Checkout', style: TextStyle(color: Colors.white, fontSize: 18)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}