import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/job_models.dart';
import '../services/api_service.dart';

final jobStatusProvider = StateNotifierProvider.family<JobStatusNotifier, AsyncValue<JobStatus>, String>((ref, jobId) {
  return JobStatusNotifier(ref.watch(apiServiceProvider), jobId);
});

class JobStatusNotifier extends StateNotifier<AsyncValue<JobStatus>> {
  final ApiService _apiService;
  final String _jobId;
  Timer? _timer;

  JobStatusNotifier(this._apiService, this._jobId) : super(const AsyncValue.loading()) {
    _startPolling();
  }

  void _startPolling() {
    _fetchStatus();
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      _fetchStatus();
    });
  }

  Future<void> _fetchStatus() async {
    try {
      final status = await _apiService.getJobStatus(_jobId);
      if (mounted) {
        state = AsyncValue.data(status);
        
        if (status.status == 'completed' || status.status == 'failed') {
          _timer?.cancel();
        }
      }
    } catch (e, stack) {
      if (mounted) {
        state = AsyncValue.error(e, stack);
      }
      _timer?.cancel();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
