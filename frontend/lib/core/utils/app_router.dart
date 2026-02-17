import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/configuration/screens/configuration_screen.dart';
import '../../features/processing/screens/processing_screen.dart';
import '../../features/results/screens/results_screen.dart';
import '../../features/history/screens/history_screen.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const ConfigurationScreen(),
      ),
      GoRoute(
        path: '/processing/:jobId',
        builder: (context, state) => ProcessingScreen(
          jobId: state.pathParameters['jobId']!,
        ),
      ),
      GoRoute(
        path: '/results/:jobId',
        builder: (context, state) => ResultsScreen(
          jobId: state.pathParameters['jobId']!,
        ),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const HistoryScreen(),
      ),
    ],
  );
}
