import {
  pgTable, serial, text, varchar, integer, boolean,
  timestamp, json, real, pgEnum, unique,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum        = pgEnum("role",               ["student","parent","admin"]);
export const stageEnum       = pgEnum("educational_stage",  ["kindergarten","primary","middle","high"]);
export const difficultyEnum  = pgEnum("difficulty",         ["beginner","elementary","intermediate","advanced","expert"]);
export const lessonStatusEnum= pgEnum("lesson_status",      ["not_started","in_progress","completed","needs_review"]);
export const questionTypeEnum= pgEnum("question_type",      ["multiple_choice","true_false","fill_blank","short_answer","math_input"]);
export const contentTypeEnum = pgEnum("content_type",       ["text","video","audio","image","interactive","quiz"]);
export const subPlanEnum     = pgEnum("subscription_plan",  ["free","monthly","yearly"]);
export const subStatusEnum   = pgEnum("subscription_status",["active","cancelled","expired","trial"]);
export const avatarTypeEnum  = pgEnum("avatar_type",        ["cartoon","ai_human","professional"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:                serial("id").primaryKey(),
  email:             varchar("email",      { length: 255 }).notNull().unique(),
  passwordHash:      text("password_hash").notNull(),
  role:              roleEnum("role").notNull().default("parent"),
  firstName:         varchar("first_name", { length: 100 }).notNull(),
  lastName:          varchar("last_name",  { length: 100 }).notNull(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).notNull().default("en"),
  isActive:          boolean("is_active").notNull().default(true),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id:          serial("id").primaryKey(),
  parentId:    integer("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan:        subPlanEnum("plan").notNull().default("free"),
  status:      subStatusEnum("status").notNull().default("trial"),
  aiAvatarEnabled: boolean("ai_avatar_enabled").notNull().default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd:   timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// ─── Student Profiles ─────────────────────────────────────────────────────────
export const studentProfiles = pgTable("student_profiles", {
  id:                serial("id").primaryKey(),
  userId:            integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId:          integer("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName:       varchar("display_name", { length: 100 }).notNull(),
  grade:             integer("grade").notNull().default(1),
  stage:             stageEnum("stage").notNull().default("primary"),
  age:               integer("age"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).notNull().default("en"),
  selectedAvatarId:  integer("selected_avatar_id"),
  learningLevel:     difficultyEnum("learning_level").notNull().default("beginner"),
  xpPoints:          integer("xp_points").notNull().default(0),
  streakDays:        integer("streak_days").notNull().default(0),
  lastActiveDate:    timestamp("last_active_date"),
  totalStudyMinutes: integer("total_study_minutes").notNull().default(0),
  weakSubjects:      json("weak_subjects").$type<string[]>().default([]),
  strongSubjects:    json("strong_subjects").$type<string[]>().default([]),
  // Parental permissions (stored per-student)
  microphoneAllowed: boolean("microphone_allowed").notNull().default(false),
  cameraAllowed:     boolean("camera_allowed").notNull().default(false),
  maxDailyMinutes:   integer("max_daily_minutes").default(120),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
});

// ─── Avatars ──────────────────────────────────────────────────────────────────
export const avatars = pgTable("avatars", {
  id:          serial("id").primaryKey(),
  name:        varchar("name",    { length: 100 }).notNull(),
  nameAr:      varchar("name_ar", { length: 100 }),
  type:        avatarTypeEnum("type").notNull().default("cartoon"),
  gender:      varchar("gender",  { length: 20 }).default("neutral"),
  description: text("description"),
  emoji:       varchar("emoji",   { length: 20 }),          // for cartoon
  imageUrl:    text("image_url"),                           // for AI human
  voiceTone:   varchar("voice_tone", { length: 50 }).default("friendly"),
  stages:      json("stages").$type<string[]>().default(["kindergarten","primary","middle","high"]),
  isPremium:   boolean("is_premium").notNull().default(false),
  isActive:    boolean("is_active").notNull().default(true),
  sortOrder:   integer("sort_order").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjects = pgTable("subjects", {
  id:          serial("id").primaryKey(),
  name:        varchar("name",    { length: 100 }).notNull(),
  nameAr:      varchar("name_ar", { length: 100 }),
  slug:        varchar("slug",    { length: 100 }).notNull().unique(),
  description: text("description"),
  iconEmoji:   varchar("icon_emoji", { length: 10 }).default("📚"),
  color:       varchar("color",      { length: 20 }).default("#6366f1"),
  stages:      json("stages").$type<string[]>().default(["primary","middle","high"]),
  isActive:    boolean("is_active").notNull().default(true),
  sortOrder:   integer("sort_order").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = pgTable("lessons", {
  id:              serial("id").primaryKey(),
  subjectId:       integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  title:           varchar("title",    { length: 255 }).notNull(),
  titleAr:         varchar("title_ar", { length: 255 }),
  description:     text("description"),
  content:         text("content"),
  contentAr:       text("content_ar"),
  stage:           stageEnum("stage").notNull().default("primary"),
  grade:           integer("grade").notNull().default(1),
  difficulty:      difficultyEnum("difficulty").notNull().default("beginner"),
  contentType:     contentTypeEnum("content_type").notNull().default("text"),
  durationMinutes: integer("duration_minutes").notNull().default(15),
  xpReward:        integer("xp_reward").notNull().default(10),
  sortOrder:       integer("sort_order").notNull().default(0),
  isPublished:     boolean("is_published").notNull().default(false),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ─── Questions ────────────────────────────────────────────────────────────────
export const questions = pgTable("questions", {
  id:            serial("id").primaryKey(),
  lessonId:      integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  subjectId:     integer("subject_id").references(() => subjects.id),
  text:          text("text").notNull(),
  textAr:        text("text_ar"),
  type:          questionTypeEnum("type").notNull().default("multiple_choice"),
  options:       json("options").$type<string[]>().default([]),
  optionsAr:     json("options_ar").$type<string[]>().default([]),
  correctAnswer: text("correct_answer").notNull(),
  explanation:   text("explanation"),
  explanationAr: text("explanation_ar"),
  difficulty:    difficultyEnum("difficulty").notNull().default("beginner"),
  grade:         integer("grade").notNull().default(1),
  stage:         stageEnum("stage").notNull().default("primary"),
  xpReward:      integer("xp_reward").notNull().default(5),
  hints:         json("hints").$type<string[]>().default([]),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

// ─── Lesson Progress ──────────────────────────────────────────────────────────
export const lessonProgress = pgTable("lesson_progress", {
  id:              serial("id").primaryKey(),
  studentId:       integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  lessonId:        integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  status:          lessonStatusEnum("status").notNull().default("not_started"),
  progressPercent: integer("progress_percent").notNull().default(0),
  timeSpentMinutes:integer("time_spent_minutes").notNull().default(0),
  completedAt:     timestamp("completed_at"),
  score:           real("score"),
  attempts:        integer("attempts").notNull().default(0),
  startedAt:       timestamp("started_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => [unique().on(t.studentId, t.lessonId)]);

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export const quizAttempts = pgTable("quiz_attempts", {
  id:             serial("id").primaryKey(),
  studentId:      integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  subjectId:      integer("subject_id").references(() => subjects.id),
  score:          real("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  timeTakenSeconds: integer("time_taken_seconds"),
  answers:        json("answers").$type<Record<string,string>>().default({}),
  passed:         boolean("passed").notNull().default(false),
  xpEarned:       integer("xp_earned").notNull().default(0),
  completedAt:    timestamp("completed_at").notNull().defaultNow(),
});

// ─── AI Conversations ─────────────────────────────────────────────────────────
export const aiConversations = pgTable("ai_conversations", {
  id:        serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  lessonId:  integer("lesson_id").references(() => lessons.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  messages:  json("messages").$type<{role:string;content:string}[]>().default([]),
  context:   json("context").$type<Record<string,unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Achievements ─────────────────────────────────────────────────────────────
export const achievements = pgTable("achievements", {
  id:            serial("id").primaryKey(),
  name:          varchar("name",    { length: 100 }).notNull(),
  nameAr:        varchar("name_ar", { length: 100 }),
  description:   text("description"),
  descriptionAr: text("description_ar"),
  iconEmoji:     varchar("icon_emoji", { length: 10 }).default("🏆"),
  category:      varchar("category",   { length: 50 }).default("general"),
  xpReward:      integer("xp_reward").notNull().default(25),
  condition:     json("condition").$type<Record<string,unknown>>().default({}),
  isActive:      boolean("is_active").notNull().default(true),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

export const studentAchievements = pgTable("student_achievements", {
  id:            serial("id").primaryKey(),
  studentId:     integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  earnedAt:      timestamp("earned_at").notNull().defaultNow(),
}, (t) => [unique().on(t.studentId, t.achievementId)]);

// ─── Recommendations ──────────────────────────────────────────────────────────
export const recommendations = pgTable("recommendations", {
  id:          serial("id").primaryKey(),
  studentId:   integer("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  lessonId:    integer("lesson_id").references(() => lessons.id),
  subjectId:   integer("subject_id").references(() => subjects.id),
  reason:      text("reason"),
  priority:    integer("priority").notNull().default(5),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── System Settings ──────────────────────────────────────────────────────────
export const systemSettings = pgTable("system_settings", {
  id:          serial("id").primaryKey(),
  key:         varchar("key",   { length: 100 }).notNull().unique(),
  value:       text("value"),
  description: text("description"),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type User             = typeof users.$inferSelect;
export type InsertUser       = typeof users.$inferInsert;
export type StudentProfile   = typeof studentProfiles.$inferSelect;
export type Subject          = typeof subjects.$inferSelect;
export type Lesson           = typeof lessons.$inferSelect;
export type Question         = typeof questions.$inferSelect;
export type Achievement      = typeof achievements.$inferSelect;
export type Avatar           = typeof avatars.$inferSelect;
export type LessonProgress   = typeof lessonProgress.$inferSelect;
export type QuizAttempt      = typeof quizAttempts.$inferSelect;
export type Subscription     = typeof subscriptions.$inferSelect;
export type Recommendation   = typeof recommendations.$inferSelect;
