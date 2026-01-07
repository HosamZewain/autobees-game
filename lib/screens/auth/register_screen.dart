import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedGender = 'Male';
  String _selectedAvatar = 'assets/avatars/boy1.png'; // Default
  bool _isLoading = false;

  final List<String> _avatars = [
    'assets/avatars/boy1.png',
    'assets/avatars/boy2.png',
    'assets/avatars/girl1.png',
    'assets/avatars/girl2.png',
  ];

  void _register() async {
    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('يرجى ملء جميع الحقول')));
      return;
    }

    setState(() => _isLoading = true);

    final result = await context.read<AuthService>().register(
        username, password,
        email: email, gender: _selectedGender, profilePic: _selectedAvatar);

    setState(() => _isLoading = false);

    if (result['success']) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['error'] ?? 'فشل إنشاء الحساب')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء حساب جديد'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF5D4037),
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFFF7E6), Color(0xFFFFECB3), Color(0xFFFFF8E1)],
          ),
        ),
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.symmetric(horizontal: 25.0, vertical: 100.0),
          child: Column(
            children: [
              const Text(
                'انضم إلينا الآن',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF5D4037),
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'خطوات بسيطة لتبدأ رحلتك في عالم الكلمات',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.brown,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 30),

              // Step 1: Avatar
              _buildStepIndicator(1, 'اختر شخصيتك المميزة'),
              const SizedBox(height: 15),
              // Avatar Selector
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _avatars.length,
                  itemBuilder: (context, index) {
                    final avatar = _avatars[index];
                    final isSelected = _selectedAvatar == avatar;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedAvatar = avatar),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                        padding: EdgeInsets.all(isSelected ? 4 : 0),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected
                              ? Colors.green.withOpacity(0.3)
                              : Colors.transparent,
                          border: isSelected
                              ? Border.all(
                                  color: const Color(0xFF66BB6A), width: 3)
                              : null,
                        ),
                        child: CircleAvatar(
                          radius: isSelected ? 40 : 35,
                          backgroundColor: Colors.white,
                          backgroundImage: AssetImage(avatar),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 30),

              // Step 2: Info
              _buildStepIndicator(2, 'أدخل بيانات الحساب'),
              const SizedBox(height: 15),
              _buildInputField(
                controller: _usernameController,
                label: 'اسم المستخدم (الاسم الكامل)',
                icon: Icons.person_outline,
              ),
              const SizedBox(height: 20),

              _buildInputField(
                controller: _emailController,
                label: 'البريد الإلكتروني',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 20),

              // Gender Selector
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: DropdownButtonFormField<String>(
                  value: _selectedGender,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    icon: Icon(Icons.people_outline, color: Color(0xFF5D4037)),
                  ),
                  items: [
                    {'display': 'ذكر', 'value': 'Male'},
                    {'display': 'أنثى', 'value': 'Female'},
                  ].map((Map<String, String> item) {
                    return DropdownMenuItem<String>(
                      value: item['value'],
                      child: Text(item['display']!,
                          style: const TextStyle(fontFamily: 'Cairo')),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedGender = val!),
                ),
              ),
              const SizedBox(height: 20),

              _buildInputField(
                controller: _passwordController,
                label: 'كلمة المرور',
                icon: Icons.lock_outline,
                isPassword: true,
              ),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: TweenAnimationBuilder<double>(
                  tween:
                      Tween<double>(begin: 1.0, end: _isLoading ? 0.95 : 1.0),
                  duration: const Duration(milliseconds: 200),
                  builder: (context, scale, child) => Transform.scale(
                    scale: scale,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF66BB6A),
                        foregroundColor: Colors.white,
                        elevation: 5,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('إنشاء الحساب',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo',
                              )),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              // Final Guidance
              const Text(
                'بإنشاء حسابك، ستتمكن من حفظ تقدمك والمنافسة في لوحة الصدارة العالمية!',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.brown,
                  fontFamily: 'Cairo',
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator(int step, String title) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF5D4037),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            'خطوة $step',
            style: const TextStyle(
                color: Colors.white, fontSize: 12, fontFamily: 'Cairo'),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF5D4037),
            fontFamily: 'Cairo',
          ),
        ),
      ],
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        keyboardType: keyboardType,
        textAlign: TextAlign.right,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: const Color(0xFF5D4037)),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        ),
      ),
    );
  }
}
