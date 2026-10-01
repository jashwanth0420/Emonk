import { z } from 'zod'

export const profileSchema = z.object({
  bio: z.string().max(500).optional().or(z.literal('')),
  linkedin_url: z.string().url().regex(/linkedin\.com/i, "Must be a valid LinkedIn URL").optional().or(z.literal('')),
  github_url: z.string().url().regex(/github\.com/i, "Must be a valid GitHub URL").optional().or(z.literal('')),
  leetcode_url: z.string().url().regex(/leetcode\.com/i, "Must be a valid LeetCode URL").optional().or(z.literal('')),
  hackerrank_url: z.string().url().regex(/hackerrank\.com/i, "Must be a valid HackerRank URL").optional().or(z.literal('')),
})
