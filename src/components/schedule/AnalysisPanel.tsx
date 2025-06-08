import React from 'react';
import { BarChart3, AlertTriangle, Clock, PieChart } from 'lucide-react';
import { ScheduleAnalysis } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatTimeForDisplay, formatDuration } from '../../utils/time-utils';

interface AnalysisPanelProps {
  analysis: ScheduleAnalysis | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Schedule Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Add time slots to see analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const { conflicts, utilization, gaps, suggestions } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Schedule Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="ml-2 text-sm font-medium">Conflicts</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{conflicts.length}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-sm font-medium">Utilization</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">
              {Math.round(utilization)}%
            </p>
          </div>
        </div>

        {gaps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Time Gaps
            </h3>
            <div className="space-y-1">
              {gaps.slice(0, 3).map((gap) => (
                <div
                  key={gap.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {formatTimeForDisplay(gap.startTime)} -{' '}
                    {formatTimeForDisplay(gap.endTime)}
                  </span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    ({formatDuration(gap.duration)})
                  </span>
                </div>
              ))}
              {gaps.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  + {gaps.length - 3} more gaps
                </p>
              )}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Suggestions</h3>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-2 text-sm text-blue-800 dark:text-blue-200"
                >
                  {suggestion.description}
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  + {suggestions.length - 3} more suggestions
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
