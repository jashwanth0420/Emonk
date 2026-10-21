'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

interface QuestionDetailsModalProps {
  question: {
    id: string
    question_text: string
    question_type: string
    difficulty: string
    expected_concepts?: string[] | null
    options?: string[] | null
    correct_answer?: string | null
    source?: string
    review_status: string
    topics?: { name: string } | null
  }
}

export function QuestionDetailsModal({ question }: QuestionDetailsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full hover:underline hover:text-foreground text-xs text-foreground/90 transition-colors flex items-center justify-between group"
      >
        <span className="truncate max-w-[280px] xl:max-w-[400px]">
          {question.question_text}
        </span>
        <Eye className="w-3.5 h-3.5 ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {question.topics?.name || 'General Topic'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' :
                question.difficulty === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
              }`}>
                {question.difficulty}
              </span>
              <Badge variant="outline" className="capitalize text-[10px]">
                {question.question_type.replace('_', ' ')}
              </Badge>
            </div>
            <DialogTitle className="text-base text-foreground font-semibold leading-relaxed pt-1">
              Question Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-muted-foreground/10 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Full Question Prompt:
              </span>
              <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                {question.question_text}
              </p>
            </div>

            {question.expected_concepts && question.expected_concepts.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Expected Key Concepts / Rubric:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {question.expected_concepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[11px] font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {question.options && question.options.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Multiple Choice Options:
                </span>
                <ul className="space-y-1 pl-1">
                  {question.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={`p-2 rounded border text-xs ${
                        opt === question.correct_answer
                          ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 font-semibold'
                          : 'bg-muted/20 border-border text-foreground'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                      {opt === question.correct_answer && ' ✓ (Correct Answer)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {question.correct_answer && (!question.options || question.options.length === 0) && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Expected / Correct Answer:
                </span>
                <p className="text-xs p-2 rounded bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 font-mono">
                  {question.correct_answer}
                </p>
              </div>
            )}

            <div className="pt-2 border-t flex items-center justify-between text-muted-foreground text-[11px]">
              <span>Source: <strong className="capitalize text-foreground">{question.source || 'system'}</strong></span>
              <span>Status: <strong className="capitalize text-foreground">{question.review_status.replace('_', ' ')}</strong></span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
