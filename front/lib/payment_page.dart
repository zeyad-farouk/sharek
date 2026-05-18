import 'package:flutter/material.dart';

class PaymentPage extends StatefulWidget {
  final double totalAmount; // استلام المبلغ

  const PaymentPage({super.key, required this.totalAmount});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  String selectedPayment = 'visa';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: const Color(0xFF6B46C1),
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6B46C1), Color(0xFF4299E1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            Expanded(
              child: Container(
                margin: const EdgeInsets.only(top: 20),
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Select Payment Method', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 20),
                    _buildPaymentOption('Credit/Debit Card', Icons.credit_card, 'visa'),
                    const SizedBox(height: 10),
                    _buildPaymentOption('Vodafone Cash', Icons.phone_android, 'vodafone'),
                    
                    const Spacer(),
                    
                    // عرض المبلغ الحقيقي
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Amount', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Text(
                            '\$${widget.totalAmount.toStringAsFixed(2)}', // المبلغ اللي اتبعت
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF6B46C1)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        onPressed: () {
                          // عملية دفع ناجحة
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text("Success"),
                              content: Text("Payment of \$${widget.totalAmount.toStringAsFixed(2)} Successful!"),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(ctx); // Close dialog
                                    Navigator.popUntil(context, (route) => route.isFirst); // Go back home
                                  },
                                  child: const Text("Home"),
                                )
                              ],
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E3A8A),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        ),
                        child: const Text('Confirm Payment', style: TextStyle(fontSize: 18, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String title, IconData icon, String val) {
    bool isSelected = selectedPayment == val;
    return GestureDetector(
      onTap: () => setState(() => selectedPayment = val),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6B46C1).withOpacity(0.1) : Colors.white,
          border: Border.all(color: isSelected ? const Color(0xFF6B46C1) : Colors.grey.shade300, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF6B46C1) : Colors.grey),
            const SizedBox(width: 12),
            Expanded(child: Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: isSelected ? const Color(0xFF6B46C1) : Colors.black))),
            if (isSelected) const Icon(Icons.check_circle, color: Color(0xFF6B46C1)),
          ],
        ),
      ),
    );
  }
}