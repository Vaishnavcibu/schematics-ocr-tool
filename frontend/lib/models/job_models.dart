import 'dart:convert';

class JobStatus {
  final String jobId;
  final String status;
  final String currentStage;
  final double progress;
  final int estimatedTimeRemaining;

  JobStatus({
    required this.jobId,
    required this.status,
    required this.currentStage,
    required this.progress,
    required this.estimatedTimeRemaining,
  });

  factory JobStatus.fromJson(Map<String, dynamic> json) {
    return JobStatus(
      jobId: json['job_id'] ?? '',
      status: json['status'] ?? 'pending',
      currentStage: json['current_stage'] ?? 'upload',
      progress: (json['progress'] ?? 0).toDouble(),
      estimatedTimeRemaining: json['estimated_time_remaining_seconds'] ?? 0,
    );
  }
}

class JobResults {
  final String jobId;
  final String filename;
  final Map<String, dynamic> stats;
  final Map<String, List<ExtractedItem>> results;

  JobResults({
    required this.jobId,
    required this.filename,
    required this.stats,
    required this.results,
  });

  factory JobResults.fromJson(Map<String, dynamic> json) {
    final Map<String, List<ExtractedItem>> parsedResults = {};
    if (json['results'] != null) {
      final resultsMap = json['results'] as Map<String, dynamic>;
      resultsMap.forEach((key, value) {
        parsedResults[key] = (value as List)
            .map((item) => ExtractedItem.fromJson(item))
            .toList();
      });
    }

    return JobResults(
      jobId: json['job_id'] ?? '',
      filename: json['filename'] ?? '',
      stats: json['stats'] ?? {},
      results: parsedResults,
    );
  }
}

class ExtractedItem {
  final String id;
  final String text;
  final int page;
  final bool isEdited;

  ExtractedItem({
    required this.id,
    required this.text,
    required this.page,
    required this.isEdited,
  });

  factory ExtractedItem.fromJson(Map<String, dynamic> json) {
    return ExtractedItem(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      page: json['page'] ?? 0,
      isEdited: json['isEdited'] ?? false,
    );
  }
}
