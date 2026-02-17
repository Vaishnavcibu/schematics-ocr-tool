import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

final uploadProvider = StateNotifierProvider<UploadNotifier, AsyncValue<String?>>((ref) {
  return UploadNotifier(ref.watch(apiServiceProvider));
});

class UploadNotifier extends StateNotifier<AsyncValue<String?>> {
  final ApiService _apiService;

  UploadNotifier(this._apiService) : super(const AsyncValue.data(null));

  Future<void> upload({
    required File file,
    required List<String> mainHeadings,
    required List<String> testPointFilters,
    required List<String> componentFilters,
    required bool regexMode,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _apiService.uploadSchematic(
        file: file,
        mainHeadings: mainHeadings,
        testPointFilters: testPointFilters,
        componentFilters: componentFilters,
        regexMode: regexMode,
      );
      
      final jobId = result['job_id'];
      state = AsyncValue.data(jobId);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
  
  void reset() {
    state = const AsyncValue.data(null);
  }
}
