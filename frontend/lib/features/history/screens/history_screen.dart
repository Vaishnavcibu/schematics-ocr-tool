import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/history_provider.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(historyProvider(1));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Processing History'),
      ),
      body: historyAsync.when(
        data: (jobs) => _buildJobList(context, jobs),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildJobList(BuildContext context, List<dynamic> jobs) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.history_rounded, size: 64, color: AppColors.textMuted),
            const SizedBox(height: 16),
            const Text('No previous jobs found', style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Start New Job'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: jobs.length,
      itemBuilder: (context, index) {
        final job = jobs[index];
        return _buildJobCard(context, job);
      },
    );
  }

  Widget _buildJobCard(BuildContext context, dynamic job) {
    final createdAt = DateTime.parse(job['timestamps']['createdAt']);
    final formattedDate = DateFormat('MMM dd, yyyy • HH:mm').format(createdAt);
    final status = job['status']['state'];
    final jobId = job['jobId'];

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        title: Text(job['filename'], style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(formattedDate, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 8),
            _buildStatusBadge(status),
          ],
        ),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(80, 40),
            backgroundColor: status == 'completed' ? AppColors.primary : AppColors.surfaceLight,
          ),
          onPressed: () {
            if (status == 'completed') {
              context.push('/results/$jobId');
            } else if (status == 'processing' || status == 'pending') {
              context.push('/processing/$jobId');
            }
          },
          child: const Text('View'),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'completed': color = AppColors.success; break;
      case 'failed': color = AppColors.error; break;
      case 'processing': color = AppColors.primary; break;
      default: color = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
