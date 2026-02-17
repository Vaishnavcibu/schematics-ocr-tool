import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

final historyProvider = FutureProvider.family<List<dynamic>, int>((ref, page) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getHistory(page: page);
});
