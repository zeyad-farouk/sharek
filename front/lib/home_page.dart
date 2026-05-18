import 'package:flutter/material.dart';
import 'app_data.dart'; // استيراد المخزن
import 'item_details_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<Map<String, dynamic>> categories = [
    {'icon': Icons.apps, 'label': 'All', 'color': Colors.grey},
    {'icon': Icons.architecture, 'label': 'Engineering', 'color': Colors.blue},
    {'icon': Icons.palette, 'label': 'Art Tools', 'color': Colors.purple},
    {'icon': Icons.construction, 'label': 'Construction', 'color': Colors.orange},
    {'icon': Icons.design_services, 'label': 'Design', 'color': Colors.green},
  ];

  @override
  Widget build(BuildContext context) {
    // الفلترة بناءً على الداتا الحقيقية
    List<Product> filteredItems = allProducts.where((item) {
      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCategory = _selectedCategory == 'All' || item.category == _selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF1a237e),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ... (الجزء بتاع الهيدر والبحث زي ما هو) ...
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF283593), Color(0xFF1a237e)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(30),
                    bottomRight: Radius.circular(30),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Welcome Back! 👋', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Rent or Share Tools', style: TextStyle(color: Colors.white70, fontSize: 15)),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: TextField(
                        onChanged: (v) => setState(() => _searchQuery = v),
                        decoration: const InputDecoration(
                          hintText: 'Search tools...',
                          border: InputBorder.none,
                          prefixIcon: Icon(Icons.search, color: Colors.grey),
                          contentPadding: EdgeInsets.all(16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Categories Section
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Categories', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 100,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final cat = categories[index];
                          final isSelected = _selectedCategory == cat['label'];
                          return GestureDetector(
                            onTap: () => setState(() => _selectedCategory = cat['label']),
                            child: Container(
                              margin: const EdgeInsets.only(right: 12),
                              child: Column(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: isSelected ? cat['color'] : cat['color'].withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(16),
                                      border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
                                    ),
                                    child: Icon(cat['icon'], color: isSelected ? Colors.white : cat['color'], size: 28),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(cat['label'], style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : Colors.white70)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Products List (المهم هنا)
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Text('Items (${filteredItems.length})', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ...filteredItems.map((product) {
                      return GestureDetector(
                        onTap: () {
                          // هنا النقلة المهمة: بنبعت المنتج اللي دوسنا عليه لصفحة التفاصيل
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ItemFullDetailsPage(product: product),
                            ),
                          );
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF283593),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  product.image,
                                  width: 70, height: 70, fit: BoxFit.cover,
                                  errorBuilder: (c,e,s) => Container(width:70, height:70, color: Colors.grey, child: const Icon(Icons.error)),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                                    Text(product.category, style: TextStyle(color: Colors.blue.shade200, fontSize: 12)),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.star, color: Colors.amber, size: 16),
                                        Text('${product.rating}', style: const TextStyle(color: Colors.white)),
                                        const Spacer(),
                                        Text('\$${product.price}/day', style: TextStyle(color: Colors.green.shade300, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}