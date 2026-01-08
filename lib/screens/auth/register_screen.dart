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
        title: const Text('إنشاء حساب جديد',
            style: TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        foregroundColor: const Color(0xFF4B0082), // Deep Purple
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(0, -0.6),
            radius: 0.8,
            colors: [Color(0xFFF3E8FF), Colors.white], // Purple tint to white
            stops: [0.0, 1.0],
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
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF4B0082), // Deep Purple
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'خطوات بسيطة لتبدأ رحلتك في عالم الكلمات',
                style: TextStyle(
                    fontSize: 16,
                    color: Color(0xFF6B7280), // Muted Gray
                    fontFamily: 'Cairo',
                    fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 30),

              // Step 1: Avatar
              _buildStepIndicator(1, 'اختر شخصيتك المميزة'),
              const SizedBox(height: 15),
              // Avatar Selector
              SizedBox(
                height: 110,
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
                        padding: EdgeInsets.all(isSelected ? 6 : 0),
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSelected
                                ? const Color(0xFF4ADE80)
                                    .withOpacity(0.2) // Green tint
                                : Colors.white,
                            border: isSelected
                                ? Border.all(
                                    color: const Color(0xFF22C55E),
                                    width: 4) // Green Border
                                : Border.all(color: Colors.transparent),
                            boxShadow: [
                              if (isSelected)
                                BoxShadow(
                                  color:
                                      const Color(0xFF22C55E).withOpacity(0.3),
                                  blurRadius: 15,
                                  offset: const Offset(0, 5),
                                )
                            ]),
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
                icon: Icons.person_rounded,
              ),
              const SizedBox(height: 20),

              _buildInputField(
                controller: _emailController,
                label: 'البريد الإلكتروني',
                icon: Icons.email_rounded,
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
                      color: const Color(0xFFA855F7).withOpacity(0.05),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    )
                  ],
                  border: Border.all(color: const Color(0xFFF3E8FF)),
                ),
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedGender,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    icon: Icon(Icons.people_rounded, color: Color(0xFFA855F7)),
                  ),
                  items: [
                    {'display': 'ذكر', 'value': 'Male'},
                    {'display': 'أنثى', 'value': 'Female'},
                  ].map((Map<String, String> item) {
                    return DropdownMenuItem<String>(
                      value: item['value'],
                      child: Text(item['display']!,
                          style: const TextStyle(
                              fontFamily: 'Cairo',
                              fontWeight: FontWeight.bold)),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedGender = val!),
                ),
              ),
              const SizedBox(height: 20),

              _buildInputField(
                controller: _passwordController,
                label: 'كلمة المرور',
                icon: Icons.lock_rounded,
                isPassword: true,
              ),
              const SizedBox(height: 40),

              Container(
                width: double.infinity,
                height: 55,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFFA855F7),
                      Color(0xFF7C3AED)
                    ], // Purple Gradient
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF7C3AED).withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    )
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15)),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('إنشاء الحساب',
                          style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Cairo',
                              color: Colors.white)),
                ),
              ),
              const SizedBox(height: 30),
              // Final Guidance
              const Text(
                'بإنشاء حسابك، ستتمكن من حفظ تقدمك والمنافسة في لوحة الصدارة العالمية!',
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF6B7280),
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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFA855F7), // Purple
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            'خطوة $step',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontFamily: 'Cairo',
                fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF4B0082), // Deep Purple
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
            color: const Color(0xFFA855F7).withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
        border: Border.all(color: const Color(0xFFF3E8FF)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        keyboardType: keyboardType,
        textAlign: TextAlign.right,
        style:
            const TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.grey[400], fontFamily: 'Cairo'),
          prefixIcon: Icon(icon, color: const Color(0xFFA855F7)), // Purple
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        ),
      ),
    );
  }
}
