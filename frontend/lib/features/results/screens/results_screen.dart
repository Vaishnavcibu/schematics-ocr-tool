import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/job_models.dart';
import '../../../providers/job_results_provider.dart';
import '../../../services/api_service.dart';

class ResultsScreen extends ConsumerWidget {
  final String jobId;
  const ResultsScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultsAsync = ref.watch(jobResultsProvider(jobId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Extraction Results'),
        actions: [
          IconButton(
            onPressed: () => ref.refresh(jobResultsProvider(jobId)),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: resultsAsync.when(
        data: (results) => _buildBody(context, ref, results),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, JobResults results) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCards(context, results),
          const SizedBox(height: 32),
          _buildExportSection(ref),
          const SizedBox(height: 32),
          Text(
            'Classified Items',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (results.results.isEmpty)
            const Center(child: Text('No items were classified.'))
          else
            ...results.results.entries.map((entry) => _buildCategoryAccordion(context, entry.key, entry.value)),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(BuildContext context, JobResults results) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 800 ? 4 : 2;
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 2.0,
          children: [
            _buildStatCard('Total Extracted', results.stats['totalExtracted']?.toString() ?? '0', Icons.analytics_outlined),
            _buildStatCard('Classified', results.stats['classifiedCount']?.toString() ?? '0', Icons.label_important_outline),
            _buildStatCard('Unclassified', results.stats['unclassifiedCount']?.toString() ?? '0', Icons.help_outline),
            _buildStatCard('Pages', results.stats['pagesProcessed']?.toString() ?? '0', Icons.description_outlined),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.glassBorder),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExportSection(WidgetRef ref) {
    return Row(
      children: [
        _buildExportButton(ref, 'JSON', Icons.code),
        const SizedBox(width: 12),
        _buildExportButton(ref, 'CSV', Icons.table_chart),
        const SizedBox(width: 12),
        _buildExportButton(ref, 'XLSX', Icons.grid_on),
      ],
    );
  }

  Widget _buildExportButton(WidgetRef ref, String format, IconData icon) {
    return Expanded(
      child: OutlinedButton.icon(
        onPressed: () => _downloadFile(ref, format),
        icon: Icon(icon, size: 18),
        label: Text(format),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  Future<void> _downloadFile(WidgetRef ref, String format) async {
    final apiService = ref.read(apiServiceProvider);
    final url = apiService.getDownloadUrl(jobId, format.toLowerCase());
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  Widget _buildCategoryAccordion(BuildContext context, String heading, List<ExtractedItem> items) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(heading, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('${items.length} items', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        leading: const Icon(Icons.folder_outlined, color: AppColors.primary),
        childrenPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        collapsedShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        children: items.map((item) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: ListTile(
              title: Text(item.text),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text('Page ${item.page}', style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
              ),
              dense: true,
            ),
          );
        }).toList(),
      ),
    );
  }
}
