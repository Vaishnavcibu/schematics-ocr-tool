import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/job_status_provider.dart';

class ProcessingScreen extends ConsumerWidget {
  final String jobId;
  const ProcessingScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(jobStatusProvider(jobId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Processing Schematic'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/'),
        ),
      ),
      body: statusAsync.when(
        data: (status) {
          if (status.status == 'completed') {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              context.go('/results/$jobId');
            });
          }

          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularPercentIndicator(
                    radius: 120.0,
                    lineWidth: 12.0,
                    percent: status.progress / 100,
                    center: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${status.progress.toInt()}%',
                          style: const TextStyle(
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          status.status.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    circularStrokeCap: CircularStrokeCap.round,
                    backgroundColor: AppColors.surface,
                    progressColor: AppColors.primary,
                    animation: true,
                    animateFromLastPercent: true,
                  ),
                  const SizedBox(height: 48),
                  Text(
                    _getStageDescription(status.currentStage),
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  _buildStageList(status.currentStage),
                  const SizedBox(height: 48),
                  if (status.status != 'completed' && status.status != 'failed')
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.timer_outlined, size: 20, color: AppColors.textMuted),
                          const SizedBox(width: 8),
                          Text(
                            'Estimated time remaining: ${_formatTime(status.estimatedTimeRemaining)}',
                            style: const TextStyle(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  if (status.status == 'failed')
                    Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: Column(
                        children: [
                          const Icon(Icons.error_outline, color: AppColors.error, size: 48),
                          const SizedBox(height: 8),
                          const Text('Processing Failed', style: TextStyle(color: AppColors.error)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => context.go('/'),
                            child: const Text('Go Back'),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: AppColors.error, size: 48),
              const SizedBox(height: 16),
              Text('Error: $err'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getStageDescription(String stage) {
    switch (stage) {
      case 'ocr':
        return 'Extracting text from PDF...';
      case 'dedup':
        return 'Removing duplicates...';
      case 'filter':
        return 'Applying pattern filters...';
      case 'classify':
        return 'Analyzing with Claude AI...';
      case 'export':
        return 'Generating reports...';
      default:
        return 'Preparing...';
    }
  }

  String _formatTime(int seconds) {
    if (seconds <= 0) return 'Few seconds';
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    if (mins == 0) return '${secs}s';
    return '${mins}m ${secs}s';
  }

  Widget _buildStageList(String currentStage) {
    final stages = ['ocr', 'dedup', 'filter', 'classify', 'export'];
    final currentIndex = stages.indexOf(currentStage);

    return Column(
      children: stages.map((stage) {
        final index = stages.indexOf(stage);
        final isActive = index == currentIndex;
        final isCompleted = index < currentIndex;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isCompleted ? Icons.check_circle : (isActive ? Icons.radio_button_checked : Icons.radio_button_off),
                size: 16,
                color: isCompleted ? AppColors.success : (isActive ? AppColors.primary : AppColors.textMuted),
              ),
              const SizedBox(width: 8),
              Text(
                _capitalize(stage),
                style: TextStyle(
                  color: isActive ? AppColors.textPrimary : AppColors.textMuted,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _capitalize(String s) => s[0].toUpperCase() + s.substring(1);
}
