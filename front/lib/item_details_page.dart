import 'package:flutter/material.dart';
import 'app_data.dart'; // استيراد المخزن

class ItemFullDetailsPage extends StatefulWidget {
  final Product product;

  const ItemFullDetailsPage({super.key, required this.product});

  @override
  State<ItemFullDetailsPage> createState() => _ItemFullDetailsPageState();
}

class _ItemFullDetailsPageState extends State<ItemFullDetailsPage> {
  bool isLiked = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text(
          widget.product.category,
          style: const TextStyle(color: Colors.grey),
        ),
      ),

      body: Column(
        children: [
          /// ================= IMAGE (تم التعديل هنا) =================
          Container(
            height: 300, // كبرنا المساحة شوية
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey.shade50, // خلفية فاتحة جداً ورا الصورة عشان الشياكة
            ),
            child: Hero(
              tag: widget.product.id,
              child: Image.network(
                widget.product.image,
                fit: BoxFit.contain, // أهم تعديل: الصورة تظهر كاملة بدون قص
                errorBuilder: (_, __, _) =>
                    const SizedBox(height: 200, child: Icon(Icons.image_not_supported, size: 50, color: Colors.grey)),
              ),
            ),
          ),

          const SizedBox(height: 20),

          /// ================= TITLE + HEART =================
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    widget.product.name,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black),
                  ),
                ),
                GestureDetector(
                  onTap: () => setState(() => isLiked = !isLiked),
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.grey.shade100,
                    child: Icon(
                      Icons.favorite,
                      color: isLiked ? Colors.redAccent : Colors.grey,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          /// ================= TABS =================
          Expanded(
            child: DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  const TabBar(
                    indicatorColor: Color.fromARGB(255, 16, 72, 117),
                    labelColor: Color.fromARGB(255, 16, 72, 117),
                    unselectedLabelColor: Colors.grey,
                    labelStyle: TextStyle(fontWeight: FontWeight.bold),
                    tabs: [
                      Tab(text: "Description"),
                      Tab(text: "Details"),
                    ],
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        // Description Tab
                        SingleChildScrollView(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Text(
                              widget.product.description,
                              style: const TextStyle(fontSize: 16, height: 1.6, color: Colors.black87),
                            ),
                          ),
                        ),
                        // Details Tab
                        SingleChildScrollView(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildDetailRow("Category", widget.product.category),
                                _buildDetailRow("Rating", "${widget.product.rating} ⭐ (${widget.product.reviews} reviews)"),
                                _buildDetailRow("Condition", "Excellent"), // مثال
                                _buildDetailRow("Location", "Cairo, Egypt"), // مثال
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      /// ================= FOOTER =================
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            )
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Total Price", style: TextStyle(color: Colors.grey, fontSize: 12)),
                Text(
                  '\$${widget.product.price}',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
                ),
              ],
            ),

            /// ADD TO CART BUTTON
            ElevatedButton.icon(
              onPressed: () {
                CartService().addToCart(widget.product);
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${widget.product.name} added to cart!'),
                    backgroundColor: Colors.green,
                    duration: const Duration(seconds: 1),
                  ),
                );

                Navigator.pushNamed(context, '/cart');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 16, 72, 117),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 2,
              ),
              icon: const Icon(Icons.shopping_cart, color: Colors.white),
              label: const Text("Add to Cart", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  // Helper widget for Details tab
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Text(
            "$label: ",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black54),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ],
      ),
    );
  }
}