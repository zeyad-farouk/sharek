import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';

const Color kMainBackground = Color.fromARGB(255, 45, 43, 88); 
const Color kAccentCyan = Color(0xFF00E5FF); 
const Color kInputFillColor = Color.fromARGB(255, 39, 37, 73); 
const Color kDarkCardBackground = Color(0xFF212121); 

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 3), () {
      _navigateToAuth();
    });
  }

  void _navigateToAuth() {
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const AuthScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kMainBackground,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: const Icon(
                Icons.people_alt_outlined,
                size: 80,
                color: kMainBackground,
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'Sharek',
              style: TextStyle(
                fontSize: 60,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 3,
              ),
            ),
            const SizedBox(height: 15),
            Text(
              'Sharing together, succeeding together',
              style: TextStyle(
                fontSize: 18,
                color: Colors.white.withOpacity(0.9),
                fontWeight: FontWeight.w400,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 60),
            ElevatedButton(
              onPressed: _navigateToAuth,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: kMainBackground,
                padding: const EdgeInsets.symmetric(horizontal: 70, vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 5,
              ),
              child: const Text(
                'Start',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 15),
            TextButton(
              onPressed: _navigateToAuth,
              child: const Text(
                'Login / Sign Up',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FloatingIcon extends StatelessWidget {
  const _FloatingIcon({
    required this.icon,
    required this.size,
    required this.color,
    required this.initialOffset,
    required this.duration,
  });

  final IconData icon;
  final double size;
  final Color color;
  final Offset initialOffset;
  final Duration duration;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: duration,
      curve: Curves.easeInOutSine,
      onEnd: () {},
      builder: (context, value, child) {
        final x = initialOffset.dx + sin(value * pi * 2) * 15; 
        final y = initialOffset.dy + cos(value * pi * 2) * 15; 

        return Positioned(
          left: x,
          top: y,
          child: Opacity(
            opacity: 0.5 + sin(value * pi) * 0.2, 
            child: Icon(
              icon,
              size: size,
              color: color.withOpacity(0.6), 
            ),
          ),
        );
      },
    );
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLogin = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12), 
    )..repeat(); 
  }

  @override
  void dispose() {
    _animationController.dispose(); 
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      // Navigation Logic Added Here
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kMainBackground, 
      appBar: AppBar(
        title: Text(_isLogin ? 'Login' : 'Create Account'),
        backgroundColor: kMainBackground,
        centerTitle: true,
      ),
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Stack(
                children: [
                  _FloatingIcon(
                    icon: Icons.computer,
                    size: 80,
                    color: kAccentCyan,
                    initialOffset: const Offset(30, 50),
                    duration: const Duration(seconds: 12),
                  ),
                  _FloatingIcon(
                    icon: Icons.edit_note,
                    size: 60,
                    color: Colors.white,
                    initialOffset: const Offset(200, 150),
                    duration: const Duration(seconds: 15),
                  ),
                   _FloatingIcon(
                    icon: Icons.person_add_alt_1,
                    size: 70,
                    color: kAccentCyan,
                    initialOffset: const Offset(50, 400),
                    duration: const Duration(seconds: 10),
                  ),
                  _FloatingIcon(
                    icon: Icons.pie_chart,
                    size: 90,
                    color: Colors.white,
                    initialOffset: const Offset(280, 500),
                    duration: const Duration(seconds: 14),
                  ),
                  _FloatingIcon(
                    icon: Icons.cloud_queue,
                    size: 50,
                    color: kAccentCyan.withOpacity(0.5),
                    initialOffset: const Offset(10, 650),
                    duration: const Duration(seconds: 11),
                  ),
                   _FloatingIcon(
                    icon: Icons.calendar_month,
                    size: 65,
                    color: Colors.white38,
                    initialOffset: const Offset(350, 10),
                    duration: const Duration(seconds: 13),
                  ),
                ],
              );
            },
          ),
          
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20.0),
                    child: Center(
                      child: ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [Color(0xFFE0B0FF), kAccentCyan, Colors.white], 
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ).createShader(bounds),
                        child: const Text(
                          'Welcome to Sharek!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            shadows: [
                              BoxShadow(
                                blurRadius: 5.0,
                                color: Colors.black45,
                                offset: Offset(0, 3),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  Card(
                    elevation: 15, 
                    color: kMainBackground.withOpacity(0.8), 
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20), 
                      side: const BorderSide(color: kAccentCyan, width: 1), 
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(30.0), 
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            TextFormField(
                              controller: _emailController,
                              style: const TextStyle(color: Colors.white),
                              decoration: const InputDecoration(
                                labelText: 'Email Address',
                                prefixIcon: Icon(Icons.email),
                              ),
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your email address';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            TextFormField(
                              controller: _passwordController,
                              style: const TextStyle(color: Colors.white),
                              decoration: const InputDecoration(
                                labelText: 'Password',
                                prefixIcon: Icon(Icons.lock),
                              ),
                              obscureText: true,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your password';
                                }
                                return null;
                              },
                            ),

                            if (!_isLogin)
                              Column(
                                children: [
                                  const SizedBox(height: 20),
                                  TextFormField(
                                    controller: _confirmPasswordController,
                                    style: const TextStyle(color: Colors.white),
                                    decoration: const InputDecoration(
                                      labelText: 'Confirm Password',
                                      prefixIcon: Icon(Icons.lock_open),
                                    ),
                                    obscureText: true,
                                    validator: (value) {
                                      if (value != _passwordController.text) {
                                        return 'Passwords do not match';
                                      }
                                      return null;
                                    },
                                  ),
                                ],
                              ),

                            const SizedBox(height: 40),

                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _submit,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: kAccentCyan, 
                                  foregroundColor: kMainBackground,
                                  padding: const EdgeInsets.symmetric(vertical: 18),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 10,
                                ),
                                child: Text(
                                  _isLogin ? 'Login' : 'Create Account',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),

                            const SizedBox(height: 20),

                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _isLogin = !_isLogin;
                                  _formKey.currentState?.reset();
                                  _emailController.clear();
                                  _passwordController.clear();
                                  _confirmPasswordController.clear();
                                });
                              },
                              child: Text(
                                _isLogin
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Login',
                                style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}