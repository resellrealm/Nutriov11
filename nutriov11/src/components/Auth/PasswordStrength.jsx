import React from 'react';
import zxcvbn from 'zxcvbn';

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const result = zxcvbn(password);
  const score = result.score; // 0-4

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];

  const widthPercentage = ((score + 1) / 5) * 100;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Password Strength
        </span>
        <span className={`text-xs font-semibold ${
          score === 0 ? 'text-red-500' :
          score === 1 ? 'text-orange-500' :
          score === 2 ? 'text-yellow-500' :
          score === 3 ? 'text-lime-500' :
          'text-green-500'
        }`}>
          {strengthLabels[score]}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColors[score]}`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      {result.feedback.warning && (
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
          {result.feedback.warning}
        </p>
      )}
      {result.feedback.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
          {result.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;
