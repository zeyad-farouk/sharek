import 'package:flutter/material.dart';

class RequestPage extends StatefulWidget {
  const RequestPage({super.key});

  @override
  State<RequestPage> createState() => _RequestPageState();
}

class _RequestPageState extends State<RequestPage>
    with SingleTickerProviderStateMixin {

  final TextEditingController clientCtrl = TextEditingController();
  final TextEditingController toolCtrl = TextEditingController();
  final TextEditingController durationCtrl = TextEditingController();

  late AnimationController _animController;
  late Animation<double> fadeAnim;
  late Animation<Offset> slideAnim;

  @override
  void initState() {
    super.initState();

    _animController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 600));

    fadeAnim = Tween<double>(begin: 0, end: 1).animate(_animController);
    slideAnim = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut));

    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xFF061A40), 
      appBar: AppBar(
        backgroundColor: const Color(0xFF061A40),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          "Tool Request",
          style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
        ),
      ),

      body: FadeTransition(
        opacity: fadeAnim,
        child: SlideTransition(
          position: slideAnim,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 5))
                ],
              ),

              child: Padding(
                padding: const EdgeInsets.all(25),
                child: SingleChildScrollView(
                  child: Column(
                    children: [

                      const Text(
                        "Fill Request Information",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 25),
                      doubleDivider(),

                      inputField(
                        label: "Client Name",
                        controller: clientCtrl,
                        icon: Icons.person,
                      ),

                      const SizedBox(height: 15),
                      doubleDivider(),

                      inputField(
                        label: "Tool Name",
                        controller: toolCtrl,
                        icon: Icons.handyman,
                      ),

                      const SizedBox(height: 15),
                      doubleDivider(),

                      inputField(
                        label: "Borrow Duration (Days)",
                        controller: durationCtrl,
                        icon: Icons.timer,
                        type: TextInputType.number,
                      ),

                      const SizedBox(height: 30),
                      doubleDivider(),
                      const SizedBox(height: 30),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            showSuccessDialog(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                          child: const Text(
                            "Confirm Request",
                            style: TextStyle(
                              color: Color(0xFF061A40),
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),

                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget inputField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    TextInputType type = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [

        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            letterSpacing: 0.4,
          ),
        ),

        const SizedBox(height: 8),

        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white),
          ),
          child: Row(
            children: [
              const SizedBox(width: 12),

              Icon(icon, color: Colors.white, size: 24),

              const SizedBox(width: 12),

              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: type,
                  style: const TextStyle(color: Colors.white, fontSize: 18),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget doubleDivider() {
    return Column(
      children: [
        Divider(color: Colors.white.withOpacity(0.7), thickness: 1),
        Divider(color: Colors.white.withOpacity(0.2), thickness: 1),
      ],
    );
  }

  void showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF0D1B3A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          "Success!",
          style: TextStyle(color: Colors.white, fontSize: 24),
        ),
        content: const Text(
          "Request Submitted Successfully.",
          style: TextStyle(color: Colors.white, fontSize: 18),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              "OK",
              style: TextStyle(color: Colors.lightBlueAccent, fontSize: 18),
            ),
          )
        ],
      ),
    );
  }
}