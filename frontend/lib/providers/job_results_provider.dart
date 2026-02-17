import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/job_models.dart';
import '../services/api_service.dart';

final jobResultsProvider = FutureProvider.family<JobResults, String>((ref, jobId) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getJobResults(jobId);
});
