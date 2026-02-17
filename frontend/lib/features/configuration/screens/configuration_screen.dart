import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/upload_provider.dart';

class ConfigurationScreen extends ConsumerStatefulWidget {
  const ConfigurationScreen({super.key});

  @override
  ConsumerState<ConfigurationScreen> createState() => _ConfigurationScreenState();
}

class _ConfigurationScreenState extends ConsumerState<ConfigurationScreen> {
  final _headingsController = TextEditingController(text: 'POWER, CPU, MEMORY, CONNECTOR, MISC');
  final _testPointsController = TextEditingController(text: 'TP*, TEST*');
  final _componentsController = TextEditingController(text: 'R*, C*, U*, Q*');
  bool _regexMode = false;
  File? _selectedFile;

  @override
  void dispose() {
    _headingsController.dispose();
    _testPointsController.dispose();
    _componentsController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
      });
    }
  }

  Future<void> _startExtraction() async {
    if (_selectedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a PDF file first')),
      );
      return;
    }

    final mainHeadings = _headingsController.text.split(',').map((e) => e.trim()).toList();
    final tpFilters = _testPointsController.text.split(',').map((e) => e.trim()).toList();
    final compFilters = _componentsController.text.split(',').map((e) => e.trim()).toList();

    await ref.read(uploadProvider.notifier).upload(
          file: _selectedFile!,
          mainHeadings: mainHeadings,
          testPointFilters: tpFilters,
          componentFilters: compFilters,
          regexMode: _regexMode,
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(uploadProvider, (previous, next) {
      next.when(
        data: (jobId) {
          if (jobId != null) {
            context.push('/processing/$jobId');
            ref.read(uploadProvider.notifier).reset();
          }
        },
        error: (err, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $err'), backgroundColor: AppColors.error),
          );
        },
        loading: () {},
      );
    });

    final uploadState = ref.watch(uploadProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Job'),
        actions: [
          IconButton(
            onPressed: () => context.push('/history'),
            icon: const Icon(Icons.history_rounded),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('1. Select PDF Schematic'),
            const SizedBox(height: 16),
            _buildUploadCard(),
            const SizedBox(height: 32),
            _buildSectionHeader('2. Classifications (Comma Separated)'),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _headingsController,
              label: 'Main Headings',
              hint: 'e.g., POWER, CPU, MEMORY',
            ),
            const SizedBox(height: 32),
            _buildSectionHeader('3. Filters & Patterns'),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _testPointsController,
              label: 'Test Point Filters',
              hint: 'e.g., TP*, TEST*',
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _componentsController,
              label: 'Component Filters',
              hint: 'e.g., R*, C*, U*',
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Switch(
                  value: _regexMode,
                  onChanged: (v) => setState(() => _regexMode = v),
                  activeColor: AppColors.primary,
                ),
                const Text('Enable Regular Expression Mode'),
              ],
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: uploadState.maybeWhen(
                loading: () => null,
                orElse: () => _startExtraction,
              ),
              child: uploadState.maybeWhen(
                loading: () => const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                ),
                orElse: () => const Text('Start Extraction'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
          ),
    );
  }

  Widget _buildUploadCard() {
    return InkWell(
      onTap: _pickFile,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _selectedFile != null ? AppColors.primary : AppColors.glassBorder,
            width: _selectedFile != null ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              _selectedFile != null ? Icons.picture_as_pdf_rounded : Icons.cloud_upload_outlined,
              size: 48,
              color: _selectedFile != null ? AppColors.primary : AppColors.textMuted,
            ),
            const SizedBox(height: 16),
            Text(
              _selectedFile != null
                  ? _selectedFile!.path.split(Platform.isWindows ? '\\' : '/').last
                  : 'Drag and drop PDF or click to browse',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _selectedFile != null ? AppColors.textPrimary : AppColors.textSecondary,
                fontWeight: _selectedFile != null ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Max size: 20MB',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          decoration: InputDecoration(hintText: hint),
        ),
      ],
    );
  }
}
