import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart'; // Add intl to pubspec if needed, or just standard formatting
import '../services/auth_service.dart';
import 'auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _usernameController;
  late TextEditingController _passwordController;

  String? _selectedGender;
  DateTime? _selectedDate;
  String _selectedAvatar = 'bee_1.png'; // Default or current

  final List<String> _avatars = [
    'bee_1.png',
    'bee_2.png',
    'bee_3.png',
    'avatar_1.png',
    'avatar_2.png',
    'avatar_3.png'
  ]; // Example avatar names, assume assets exist or use placeholders

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthService>().user;

    _usernameController = TextEditingController(text: user?['username']);
    _passwordController = TextEditingController();

    _selectedGender = user?['gender'];
    if (user?['dob'] != null) {
      try {
        _selectedDate = DateTime.parse(user!['dob']);
      } catch (_) {}
    }
    _selectedAvatar = user?['profile_pic'] ?? 'bee_1.png';
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final authService = context.read<AuthService>();

    String? formattedDate;
    if (_selectedDate != null) {
      formattedDate =
          "${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}";
    }

    final result = await authService.updateProfile({
      'username': _usernameController.text,
      'password': _passwordController.text, // Optional, handled by backend
      'gender': _selectedGender,
      'dob': formattedDate,
      'profile_pic': _selectedAvatar
    });

    setState(() => _isLoading = false);

    if (result['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تحديث الملف الشخصي بنجاح')),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ: ${result['error']}')),
        );
      }
    }
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد أنك تريد تسجيل الخروج؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () {
              context.read<AuthService>().logout();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            child: const Text('خروج', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي والإعدادات',
            style: TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFF4B0082), // Deep Purple
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: Container(
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
              const EdgeInsets.symmetric(horizontal: 20.0, vertical: 100.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // Avatar Section Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFA855F7).withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      )
                    ],
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                  ),
                  child: Column(
                    children: [
                      const Text('اختر شخصيتك',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4B0082),
                              fontFamily: 'Cairo')),
                      const SizedBox(height: 20),
                      SizedBox(
                        height: 90,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _avatars.length,
                          itemBuilder: (context, index) {
                            final avatar = _avatars[index];
                            final isSelected = avatar == _selectedAvatar;
                            return GestureDetector(
                              onTap: () =>
                                  setState(() => _selectedAvatar = avatar),
                              child: Container(
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    if (isSelected)
                                      BoxShadow(
                                        color: const Color(0xFF22C55E)
                                            .withOpacity(0.3),
                                        blurRadius: 10,
                                        offset: const Offset(0, 5),
                                      )
                                  ],
                                  border: isSelected
                                      ? Border.all(
                                          color: const Color(0xFF22C55E),
                                          width: 3) // Green
                                      : Border.all(
                                          color: Colors.transparent, width: 0),
                                ),
                                child: CircleAvatar(
                                  radius: isSelected ? 38 : 32,
                                  backgroundColor: Colors.white,
                                  backgroundImage:
                                      AssetImage('assets/avatars/$avatar'),
                                  onBackgroundImageError: (_, __) {
                                    // Fallback if asset not found, though we should ensure they exist
                                  },
                                  child: avatar.startsWith('bee') ||
                                          avatar.startsWith('avatar')
                                      ? null
                                      : const Icon(Icons.person,
                                          color: Colors.grey),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 25),

                _buildProfileField(
                  controller: _usernameController,
                  label: 'اسم المستخدم',
                  icon: Icons.person_rounded,
                ),
                const SizedBox(height: 16),

                _buildProfileField(
                  controller: _passwordController,
                  label: 'كلمة المرور الجديدة (اختياري)',
                  icon: Icons.lock_rounded,
                  isPassword: true,
                  helper: 'اتركه فارغاً إذا كنت لا تريد تغييره',
                ),
                const SizedBox(height: 16),

                // Gender Selection
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                          color: const Color(0xFFA855F7).withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4))
                    ],
                    border: Border.all(color: const Color(0xFFF3E8FF)),
                  ),
                  child: DropdownButtonFormField<String>(
                    value: _selectedGender,
                    decoration: const InputDecoration(
                      labelText: 'النوع',
                      labelStyle:
                          TextStyle(fontFamily: 'Cairo', color: Colors.grey),
                      border: InputBorder.none,
                      icon:
                          Icon(Icons.people_rounded, color: Color(0xFFA855F7)),
                    ),
                    items: const [
                      DropdownMenuItem(
                          value: 'Male',
                          child: Text('ذكر',
                              style: TextStyle(
                                  fontFamily: 'Cairo',
                                  fontWeight: FontWeight.bold))),
                      DropdownMenuItem(
                          value: 'Female',
                          child: Text('أنثى',
                              style: TextStyle(
                                  fontFamily: 'Cairo',
                                  fontWeight: FontWeight.bold))),
                    ],
                    onChanged: (val) => setState(() => _selectedGender = val),
                  ),
                ),
                const SizedBox(height: 16),

                // DOB Selection
                InkWell(
                  onTap: () => _selectDate(context),
                  child: Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                            color: const Color(0xFFA855F7).withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4))
                      ],
                      border: Border.all(color: const Color(0xFFF3E8FF)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_month_rounded,
                            color: Color(0xFFA855F7)),
                        const SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('تاريخ الميلاد',
                                style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 12,
                                    fontFamily: 'Cairo')),
                            Text(
                              _selectedDate == null
                                  ? 'غير محدد'
                                  : "${_selectedDate!.year}-${_selectedDate!.month}-${_selectedDate!.day}",
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Cairo'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 40),

                // Save Button
                Container(
                  width: double.infinity,
                  height: 55,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF4ADE80),
                        Color(0xFF22C55E)
                      ], // Green Gradient
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF22C55E).withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      )
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15)),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('حفظ التغييرات',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                fontFamily: 'Cairo')),
                  ),
                ),
                const SizedBox(height: 20),

                TextButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout_rounded,
                      color: Color(0xFFEF4444)),
                  label: const Text('تسجيل الخروج',
                      style: TextStyle(
                          color: Color(0xFFEF4444), // Red
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo')),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
    String? helper,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
              color: const Color(0xFFA855F7).withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
        border: Border.all(color: const Color(0xFFF3E8FF)),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isPassword,
        textAlign: TextAlign.right,
        style:
            const TextStyle(fontFamily: 'Cairo', fontWeight: FontWeight.bold),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.grey[400], fontFamily: 'Cairo'),
          helperText: helper,
          helperStyle: const TextStyle(fontFamily: 'Cairo'),
          prefixIcon: Icon(icon, color: const Color(0xFFA855F7)), // Purple
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        ),
        validator: (value) =>
            (label == 'اسم المستخدم' && (value == null || value.isEmpty))
                ? 'مطلوب'
                : null,
      ),
    );
  }
}
