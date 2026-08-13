import { quizRepository } from './quiz.repository'
import { NotFoundException, BadRequestException } from '@/exceptions'
import type { QuizLevel, QuizQuestionType } from '@/generated/prisma/client'
import type { CreateQuizInput, UpdateQuizInput, CreateQuestionInput, SubmitQuizInput } from './quiz.schema'

type WordLike = {
  indonesian: string
  localLanguage: string
  localScript?: string | null
  audios?: { url: string }[]
}

const ALL_TYPES: QuizQuestionType[] = [
  'ID_TO_LOCAL',
  'LOCAL_TO_ID',
  'SCRIPT_TO_ID',
  'SCRIPT_TO_LOCAL',
  'AUDIO_TO_ID',
  'AUDIO_TO_LOCAL'
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function getTargetField(type: QuizQuestionType): 'indonesian' | 'localLanguage' {
  return type === 'LOCAL_TO_ID' || type === 'SCRIPT_TO_ID' || type === 'AUDIO_TO_ID'
    ? 'indonesian'
    : 'localLanguage'
}

function isTypeValidForWord(type: QuizQuestionType, word: WordLike): boolean {
  if (type === 'SCRIPT_TO_ID' || type === 'SCRIPT_TO_LOCAL') {
    return !!word.localScript
  }
  if (type === 'AUDIO_TO_ID' || type === 'AUDIO_TO_LOCAL') {
    return !!word.audios && word.audios.length > 0
  }
  return true
}

function buildStimulus(type: QuizQuestionType, word: WordLike) {
  switch (type) {
    case 'ID_TO_LOCAL':
      return { kind: 'text' as const, value: word.indonesian, label: `Apa arti kata Indonesia "${word.indonesian}" dalam Bahasa Wolio?` }
    case 'LOCAL_TO_ID':
      return { kind: 'text' as const, value: word.localLanguage, label: `Apa arti kata Wolio "${word.localLanguage}" dalam Bahasa Indonesia?` }
    case 'SCRIPT_TO_ID':
      return { kind: 'script' as const, value: word.localScript!, label: 'Apa arti aksara Wolio berikut dalam Bahasa Indonesia?' }
    case 'SCRIPT_TO_LOCAL':
      return { kind: 'script' as const, value: word.localScript!, label: 'Apa bacaan Bahasa Wolio dari aksara berikut?' }
    case 'AUDIO_TO_ID':
      return { kind: 'audio' as const, value: word.audios![0]!.url, label: 'Dengarkan audio berikut, apa artinya dalam Bahasa Indonesia?' }
    case 'AUDIO_TO_LOCAL':
      return { kind: 'audio' as const, value: word.audios![0]!.url, label: 'Dengarkan audio berikut, apa kata Wolio yang diucapkan?' }
  }
}

export const quizService = {
  async list(query: { page?: string; limit?: string; level?: string; search?: string }) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10) || 10))
    const skip = (page - 1) * limit

    const { quizzes, total } = await quizRepository.findAll({
      skip,
      take: limit,
      level: query.level as QuizLevel | undefined,
      search: query.search
    })

    return {
      data: quizzes,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }
  },

  async getById(id: string) {
    const quiz = await quizRepository.findById(id)
    if (!quiz) throw new NotFoundException('Kuis')
    return quiz
  },

  async create(input: CreateQuizInput) {
    return quizRepository.create({ title: input.title.trim(), level: input.level })
  },

  async update(id: string, input: UpdateQuizInput) {
    const quiz = await quizRepository.findById(id)
    if (!quiz) throw new NotFoundException('Kuis')
    return quizRepository.update(id, { title: input.title.trim(), level: input.level })
  },

  async delete(id: string) {
    const quiz = await quizRepository.findById(id)
    if (!quiz) throw new NotFoundException('Kuis')
    await quizRepository.softDelete(id)
    return true
  },

  async addQuestion(quizId: string, input: CreateQuestionInput) {
    const quiz = await quizRepository.findById(quizId)
    if (!quiz) throw new NotFoundException('Kuis')

    const word = await quizRepository.findWordById(input.wordId)
    if (!word) throw new NotFoundException('Kata')

    let type: QuizQuestionType
    if (input.type) {
      if (!isTypeValidForWord(input.type, word)) {
        throw new BadRequestException(
          'Kata ini belum punya data yang cukup (aksara/audio) untuk tipe soal tersebut'
        )
      }
      type = input.type
    } else {
      const validTypes = ALL_TYPES.filter((t) => isTypeValidForWord(t, word))
      type = validTypes[Math.floor(Math.random() * validTypes.length)]!
    }

    const targetField = getTargetField(type)

    let distractors: string[]

    if (input.distractorWordIds) {
      const distractorWords = await Promise.all(
        input.distractorWordIds.map((id) => quizRepository.findWordById(id))
      )
      if (distractorWords.some((w) => !w)) {
        throw new NotFoundException('Salah satu kata pengecoh')
      }
      distractors = distractorWords.map((w) => w![targetField])
    } else {
      let pool = await quizRepository.findRandomWordsInCategory(word.categoryId, word.id, 3)
      if (pool.length < 3) {
        pool = await quizRepository.findRandomWordsAnyCategory(word.id, 3)
      }
      if (pool.length < 3) {
        throw new BadRequestException('Tidak cukup kata lain untuk membuat pengecoh')
      }
      distractors = shuffle(pool)
        .slice(0, 3)
        .map((w) => w[targetField])
    }

    const choices = shuffle([word[targetField], ...distractors])
    const order = await quizRepository.countQuestions(quizId)

    return quizRepository.createQuestion({
      quizId,
      wordId: input.wordId,
      type,
      choices,
      order
    })
  },

  async deleteQuestion(questionId: string) {
    const question = await quizRepository.findQuestionById(questionId)
    if (!question) throw new NotFoundException('Soal')
    await quizRepository.softDeleteQuestion(questionId)
    return true
  },

  // --- Public ---

  async listPublicByLevel(level: string) {
    const parsedLevel = level as QuizLevel
    const { quizzes } = await quizRepository.findAll({ skip: 0, take: 100, level: parsedLevel })
    return quizzes.filter((q) => q._count.questions > 0)
  },

  async getForPlay(id: string) {
    const quiz = await quizRepository.findById(id)
    if (!quiz) throw new NotFoundException('Kuis')

    return {
      id: quiz.id,
      title: quiz.title,
      level: quiz.level,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        stimulus: buildStimulus(q.type, q.word),
        choices: shuffle(q.choices as string[])
      }))
    }
  },

  async submitAnswers(id: string, input: SubmitQuizInput) {
    const quiz = await quizRepository.findById(id)
    if (!quiz) throw new NotFoundException('Kuis')

    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]))

    let correct = 0
    const results = input.answers.map((a) => {
      const question = questionMap.get(a.questionId)
      if (!question) {
        throw new BadRequestException('Soal tidak ditemukan pada kuis ini')
      }
      const targetField = getTargetField(question.type)
      const correctAnswer = question.word[targetField]
      const isCorrect = a.answer === correctAnswer
      if (isCorrect) correct++
      return {
        questionId: a.questionId,
        isCorrect,
        correctAnswer
      }
    })

    return {
      score: correct,
      total: quiz.questions.length,
      results
    }
  }
}
