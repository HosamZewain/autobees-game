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
        title: const Text('الملف الشخصي والإعدادات'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: const Color(0xFF5D4037),
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.amber, Color(0xFFFFF7E6)],
            stops: [0.0, 0.3],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // Avatar Section Card
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(15.0),
                    child: Column(
                      children: [
                        const Text('اختر شخصيتك',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo')),
                        const SizedBox(height: 15),
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
                                      const EdgeInsets.symmetric(horizontal: 8),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: isSelected
                                        ? Border.all(
                                            color: Colors.amber, width: 4)
                                        : Border.all(
                                            color: Colors.grey.shade200,
                                            width: 1),
                                  ),
                                  child: CircleAvatar(
                                    radius: 35,
                                    backgroundColor: Colors.white,
                                    child: Icon(Icons.person,
                                        size: 40,
                                        color: isSelected
                                            ? Colors.amber
                                            : Colors.grey),
                                    // backgroundImage: AssetImage('assets/images/$avatar'),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 25),

                _buildProfileField(
                  controller: _usernameController,
                  label: 'اسم المستخدم',
                  icon: Icons.person_outline,
                ),
                const SizedBox(height: 16),

                _buildProfileField(
                  controller: _passwordController,
                  label: 'كلمة المرور الجديدة (اختياري)',
                  icon: Icons.lock_outline,
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
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4))
                    ],
                  ),
                  child: DropdownButtonFormField<String>(
                    value: _selectedGender,
                    decoration: const InputDecoration(
                      labelText: 'النوع',
                      border: InputBorder.none,
                      icon:
                          Icon(Icons.people_outline, color: Color(0xFF5D4037)),
                    ),
                    items: const [
                      DropdownMenuItem(
                          value: 'Male',
                          child: Text('ذكر',
                              style: TextStyle(fontFamily: 'Cairo'))),
                      DropdownMenuItem(
                          value: 'Female',
                          child: Text('أنثى',
                              style: TextStyle(fontFamily: 'Cairo'))),
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
                            color: Colors.black12,
                            blurRadius: 5,
                            offset: const Offset(0, 2))
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined,
                            color: Color(0xFF5D4037)),
                        const SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('تاريخ الميلاد',
                                style: TextStyle(
                                    color: Colors.grey.shade600, fontSize: 12)),
                            Text(
                              _selectedDate == null
                                  ? 'غير محدد'
                                  : "${_selectedDate!.year}-${_selectedDate!.month}-${_selectedDate!.day}",
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 40),

                // Save Button
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber,
                      foregroundColor: Colors.black,
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15)),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : const Text('حفظ التغييرات',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo')),
                  ),
                ),
                const SizedBox(height: 20),

                TextButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text('تسجيل الخروج',
                      style: TextStyle(
                          color: Colors.red,
                          fontSize: 18,
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
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isPassword,
        textAlign: TextAlign.right,
        decoration: InputDecoration(
          labelText: label,
          helperText: helper,
          prefixIcon: Icon(icon, color: const Color(0xFF5D4037)),
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
