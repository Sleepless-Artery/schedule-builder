import React from 'react';
import { BarChart3, AlertTriangle, Clock, PieChart, TrendingUp, Zap } from 'lucide-react';
import { ScheduleAnalysis } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatTimeForDisplay, formatDuration } from '../../utils/time-utils';
import { useScheduleStore } from '../../stores/scheduleStore';

interface AnalysisPanelProps {
  analysis: ScheduleAnalysis | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis }) => {
  const { currentView } = useScheduleStore();

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

  const { conflicts, utilization, gaps, suggestions, _debug } = analysis;

  // Определяем период для отображения
  const getPeriodText = () => {
    switch (currentView) {
      case 'day': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      default: return 'current period';
    }
  };

  // Цвет для utilization в зависимости от процента
  const getUtilizationColor = (util: number) => {
    if (util < 30) return 'text-green-600 dark:text-green-400';
    if (util < 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Иконка для utilization
  const getUtilizationIcon = (util: number) => {
    if (util < 30) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (util < 70) return <BarChart3 className="h-4 w-4 text-amber-500" />;
    return <Zap className="h-4 w-4 text-red-500" />;
  };

  // Текст для utilization
  const getUtilizationText = (util: number) => {
    if (util < 20) return 'Low utilization';
    if (util < 50) return 'Moderate utilization';
    if (util < 80) return 'Good utilization';
    return 'High utilization';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Schedule Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* СТАТИСТИКА */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overview {getPeriodText()}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* CONFLICTS */}
            <div className={`rounded-lg p-3 border ${
              conflicts.length > 0 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 ${
                    conflicts.length > 0 ? 'text-red-500' : 'text-green-500'
                  }`} />
                  <span className="ml-2 text-sm font-medium">Conflicts</span>
                </div>
                <span className={`text-lg font-semibold ${
                  conflicts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {conflicts.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {conflicts.length === 0 ? 'No conflicts' : 'Needs attention'}
              </p>
            </div>

            {/* UTILIZATION */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getUtilizationIcon(utilization)}
                  <span className="ml-2 text-sm font-medium">Utilization</span>
                </div>
                <span className={`text-lg font-semibold ${getUtilizationColor(utilization)}`}>
                  {Math.round(utilization)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getUtilizationText(utilization)}
              </p>
            </div>
          </div>

          {/* ДЕТАЛИ UTILIZATION */}
          {_debug && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Scheduled:</span>
                <span className="font-medium">
                  {Math.round(_debug.totalScheduledMinutes / 60)}h {_debug.totalScheduledMinutes % 60}min
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Available:</span>
                <span className="font-medium">
                  {Math.round(_debug.totalAvailableMinutes / 60)}h
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TIME GAPS */}
        {gaps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-2" />
              Free Time Slots
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                {gaps.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gaps.slice(0, 5).map((gap) => (
                <div
                  key={gap.id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {formatTimeForDisplay(gap.startTime)} - {formatTimeForDisplay(gap.endTime)}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">
                    {formatDuration(gap.duration)}
                  </span>
                </div>
              ))}
              {gaps.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                  + {gaps.length - 5} more free slots
                </p>
              )}
            </div>
          </div>
        )}

        {/* SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 mr-2" />
              Suggestions
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            </h3>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-sm"
                >
                  <div className="flex items-start">
                    <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                  + {suggestions.length - 3} more suggestions
                </p>
              )}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {conflicts.length === 0 && gaps.length === 0 && suggestions.length === 0 && (
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No issues detected
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Your schedule looks well organized!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
