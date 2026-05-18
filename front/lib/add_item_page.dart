import 'package:flutter/material.dart';

class AddNewItemPage extends StatefulWidget {
  const AddNewItemPage({super.key});

  @override
  State<AddNewItemPage> createState() => _AddNewItemPageState();
}

class _AddNewItemPageState extends State<AddNewItemPage> {
  final _formKey = GlobalKey<FormState>();
  
  String? selectedCategory;
  String? selectedCondition;
  
  TextEditingController nameController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();
  TextEditingController priceController = TextEditingController();

  List<String> categories = ['Electronics', 'Clothing', 'Furniture', 'Books', 'Other'];
  List<String> conditions = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a2f5a),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0f1f3d),
        elevation: 0,
        title: const Text(
          'Add New Item',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              _buildLabel('Item Name'),
              const SizedBox(height: 12),
              _buildTextField(
                controller: nameController,
                hint: 'Enter item name',
                icon: Icons.shopping_bag,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter item name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildLabel('Description'),
              const SizedBox(height: 12),
              _buildTextField(
                controller: descriptionController,
                hint: 'Write item description',
                icon: Icons.description,
                maxLines: 4,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter description';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildLabel('Price'),
              const SizedBox(height: 12),
              _buildTextField(
                controller: priceController,
                hint: 'Enter price',
                icon: Icons.attach_money,
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter price';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildLabel('Category'),
              const SizedBox(height: 12),
              _buildDropdown(
                value: selectedCategory,
                items: categories,
                hint: 'Select category',
                icon: Icons.category,
                onChanged: (value) {
                  setState(() {
                    selectedCategory = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a category';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildLabel('Condition'),
              const SizedBox(height: 12),
              _buildDropdown(
                value: selectedCondition,
                items: conditions,
                hint: 'Select condition',
                icon: Icons.check_circle,
                onChanged: (value) {
                  setState(() {
                    selectedCondition = value;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a condition';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Item added successfully!'),
                          backgroundColor: Colors.green,
                          duration: Duration(seconds: 2),
                        ),
                      );
                      Navigator.pop(context);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4a90e2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 6,
                  ),
                  child: const Text(
                    'Add Item',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white54, fontSize: 16),
        filled: true,
        fillColor: const Color(0xFF2a4070),
        prefixIcon: Icon(icon, color: Colors.white70, size: 22),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        errorStyle: const TextStyle(color: Colors.redAccent),
      ),
    );
  }

  Widget _buildDropdown({
    required String? value,
    required List<String> items,
    required String hint,
    required IconData icon,
    required void Function(String?) onChanged,
    String? Function(String?)? validator,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      items: items
          .map((item) => DropdownMenuItem(
                value: item,
                child: Text(
                  item,
                  style: const TextStyle(color: Colors.black, fontSize: 16),
                ),
              ))
          .toList(),
      onChanged: onChanged,
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white54, fontSize: 16),
        filled: true,
        fillColor: const Color(0xFF2a4070),
        prefixIcon: Icon(icon, color: Colors.white70, size: 22),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        errorStyle: const TextStyle(color: Colors.redAccent),
      ),
      style: const TextStyle(color: Colors.black, fontSize: 16),
      dropdownColor: const Color(0xFF2a4070),
      iconEnabledColor: Colors.white70,
    );
  }
}