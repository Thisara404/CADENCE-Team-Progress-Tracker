export interface TaskRevisionFeedback {
  taskName: string;
  note: string;
  tags?: string[];
}

export interface BlockerRevisionFeedback {
  blocker: string;
  note: string;
}

export interface HighlightRevisionFeedback {
  highlight: string;
  note: string;
}

export interface StructuredFeedback {
  summary: string;
  taskFeedback?: TaskRevisionFeedback[];
  blockerFeedback?: BlockerRevisionFeedback[];
  highlightFeedback?: HighlightRevisionFeedback[];
}

export function parseReviewComment(rawComment?: string | null): StructuredFeedback {
  if (!rawComment) {
    return { summary: '' };
  }

  const trimmed = rawComment.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        summary: parsed.summary || '',
        taskFeedback: Array.isArray(parsed.taskFeedback) ? parsed.taskFeedback : [],
        blockerFeedback: Array.isArray(parsed.blockerFeedback) ? parsed.blockerFeedback : [],
        highlightFeedback: Array.isArray(parsed.highlightFeedback) ? parsed.highlightFeedback : [],
      };
    } catch {
      // fallback to plain string
    }
  }

  return {
    summary: rawComment,
    taskFeedback: [],
    blockerFeedback: [],
    highlightFeedback: [],
  };
}

export function serializeReviewComment(feedback: StructuredFeedback): string {
  const hasStructuredItems =
    (feedback.taskFeedback && feedback.taskFeedback.length > 0) ||
    (feedback.blockerFeedback && feedback.blockerFeedback.length > 0) ||
    (feedback.highlightFeedback && feedback.highlightFeedback.length > 0);

  if (!hasStructuredItems) {
    return feedback.summary.trim();
  }

  return JSON.stringify({
    summary: feedback.summary.trim(),
    taskFeedback: feedback.taskFeedback || [],
    blockerFeedback: feedback.blockerFeedback || [],
    highlightFeedback: feedback.highlightFeedback || [],
  });
}
