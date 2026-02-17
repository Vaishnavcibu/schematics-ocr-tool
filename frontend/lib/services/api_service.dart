import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/job_models.dart';

final apiServiceProvider = Provider((ref) => ApiService());

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3000/api', // Default local backend URL
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 60),
    ),
  );

  /// Uploads a schematic file with configuration
  Future<Map<String, dynamic>> uploadSchematic({
    required File file,
    required List<String> mainHeadings,
    required List<String> testPointFilters,
    required List<String> componentFilters,
    required bool regexMode,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
        'mainHeadings': mainHeadings.join(','),
        'testPointFilters': testPointFilters.join(','),
        'componentFilters': componentFilters.join(','),
        'regexMode': regexMode.toString(),
      });

      final response = await _dio.post('/upload', data: formData);
      return response.data['data'];
    } catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  /// Fetches the status of a processing job
  Future<JobStatus> getJobStatus(String jobId) async {
    try {
      final response = await _dio.get('/status/$jobId');
      return JobStatus.fromJson(response.data['data']);
    } catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  /// Fetches the results of a completed job
  Future<JobResults> getJobResults(String jobId) async {
    try {
      final response = await _dio.get('/results/$jobId');
      return JobResults.fromJson(response.data['data']);
    } catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  /// Fetches the job history
  Future<List<dynamic>> getHistory({int page = 1, int limit = 10}) async {
    try {
      final response = await _dio.get('/history', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return response.data['data']['jobs'];
    } catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  /// Downloads a file in the specified format
  String getDownloadUrl(String jobId, String format) {
    return 'http://localhost:3000/api/download/$jobId/$format';
  }

  void _handleError(dynamic e) {
    if (e is DioException) {
      final message = e.response?.data?['error']?['message'] ?? e.message;
      throw Exception(message);
    }
    throw Exception('An unexpected error occurred');
  }
}
