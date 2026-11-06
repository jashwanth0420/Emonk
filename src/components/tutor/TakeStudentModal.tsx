'use client'

import { useState, useTransition } from 'react'
import { UserPlus, BookOpen, Check, Sparkles, X } from 'lucide-react'
import { takeStudentAction } from '@/app/(protected)/tutor/actions'

interface Topic {
  id: string
  name: string
  category?: string | null
}

interface Student {
  id: string
  full_name: string
  register_number?: string | null
  department?: string | null
  year?: number | null
}

interface TakeStudentModalProps {
  student: Student
  topics: Topic[]
  onSuccess?: () => void
}

export function TakeStudentModal({ student, topics, onSuccess }: TakeStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [taskInstructions, setTaskInstructions] = useState('')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    )
  }

  const handleQuickTemplate = (template: string) => {
    setTaskInstructions(template)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (selectedTopicIds.length === 0 && topics.length > 0) {
      setErrorMsg('Please select at least one topic to assign.')
      return
    }

    const formData = new FormData()
    formData.append('student_id', student.id)
    formData.append('task_instructions', taskInstructions)
    selectedTopicIds.forEach(id => formData.append('topic_ids', id))

    startTransition(async () => {
      const res = await takeStudentAction(formData)
      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to assign student')
      } else {
        setIsOpen(false)
        if (onSuccess) onSuccess()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111215] text-[#EBFD78] hover:bg-black font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5 text-[#EBFD78]" />
        Take Student
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-5 pr-8">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EBFD78] text-[#111315] inline-block mb-2">
                Mentorship Assignment
              </span>
              <h3 className="text-xl font-bold text-[#111315]">
                Take {student.full_name}
              </h3>
              <p className="text-xs text-[#737780] mt-0.5">
                {student.register_number ? `Reg: ${student.register_number} • ` : ''}
                {student.department ? `${student.department} • ` : ''}
                {student.year ? `Year ${student.year}` : 'Student'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Topics Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111315] flex items-center justify-between">
                  <span>Select Topics to Cover Today</span>
                  <span className="text-[11px] font-normal text-[#737780]">
                    {selectedTopicIds.length} selected
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#F9FAFB] rounded-2xl border border-black/[0.04]">
                  {topics.map(topic => {
                    const isSelected = selectedTopicIds.includes(topic.id)
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#111215] text-[#EBFD78] shadow-sm'
                            : 'bg-white text-[#111315] border border-black/[0.08] hover:bg-gray-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#EBFD78]" />}
                        {topic.name}
                      </button>
                    )
                  })}
                  {topics.length === 0 && (
                    <p className="text-xs text-[#737780] py-2">No active topics found in catalog.</p>
                  )}
                </div>
              </div>

              {/* Task Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111315]">
                    Task Instructions & Questions for Student
                  </label>
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickTemplate('Review the core theory of the assigned topics, implement the standard algorithm, and explain time/space complexities.')}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111315] transition-colors cursor-pointer"
                  >
                    + Algorithm & Complexity
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTemplate('Solve 2 LeetCode problems related to the topic, document edge cases tested, and write clean commented code.')}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111315] transition-colors cursor-pointer"
                  >
                    + Problem Solving
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTemplate('Explain how to optimize the brute-force approach into an optimal solution with proper code examples.')}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111315] transition-colors cursor-pointer"
                  >
                    + Code Optimization
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={taskInstructions}
                  onChange={e => setTaskInstructions(e.target.value)}
                  placeholder="e.g. Study Binary Search and Two Pointers. Write solutions for Two Sum and Three Sum, explaining runtime complexity."
                  className="w-full text-xs p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215] text-[#111315] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#737780] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-full bg-[#111215] text-white hover:bg-black font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EBFD78]" />
                  {isPending ? 'Assigning...' : 'Assign & Take Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
