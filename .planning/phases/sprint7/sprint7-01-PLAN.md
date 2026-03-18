---
phase: sprint7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/db/models/InstructionProfile.ts
  - src/lib/db/schemas.ts
  - src/app/api/instruction-profiles/route.ts
  - src/app/api/instruction-profiles/[id]/route.ts
  - src/lib/ai/instruction-profile.ts
autonomous: true
requirements:
  - PROFILE-01
  - PROFILE-02
  - PROFILE-03
must_haves:
  truths:
    - InstructionProfile model stores name, instructionText, applicableOperations, isDefault
    - GET/POST /api/instruction-profiles list and create profiles
    - GET/PUT/DELETE /api/instruction-profiles/[id] CRUD single profile
    - getProfileInstruction(profileId) returns instruction text or empty string
  artifacts:
    - path: src/lib/db/models/InstructionProfile.ts
      provides: InstructionProfile model
    - path: src/lib/db/schemas.ts
      provides: CreateInstructionProfileSchema, UpdateInstructionProfileSchema
    - path: src/app/api/instruction-profiles/route.ts
      provides: GET, POST
    - path: src/app/api/instruction-profiles/[id]/route.ts
      provides: GET, PUT, DELETE
    - path: src/lib/ai/instruction-profile.ts
      provides: getProfileInstruction(profileId)
  key_links:
    - from: instruction-profiles/route.ts
      to: InstructionProfile model
      via: find, create
    - from: instruction-profile.ts
      to: InstructionProfile
      via: findById, return instructionText
---

<objective>
InstructionProfile model, CRUD API, getProfileInstruction helper.
Purpose: Foundation for persona-based system prompts that prepend to AI operations.
Output: InstructionProfile model, /api/instruction-profiles, instruction-profile.ts helper.
</objective>

<context>
@.planning/phases/sprint7/RESEARCH.md
@src/app/api/tags/route.ts
@src/app/api/tags/[id]/route.ts
@src/lib/db/models/Tag.ts
@src/lib/db/schemas.ts
</context>

<interfaces>
From tags API: getServerSession(), connectToDatabase(), Zod validation, Types.ObjectId.isValid
From Tag model: Schema with timestamps, mongoose.models check
Applicable operations: script-generation, hook-generation, virality-scoring, repurposing, seo-generation, evergreen-scoring, planner, insight-report, tagging, prompt-run (or ['*'] for all)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create InstructionProfile model and Zod schemas</name>
  <files>src/lib/db/models/InstructionProfile.ts, src/lib/db/schemas.ts</files>
  <action>
1. Create src/lib/db/models/InstructionProfile.ts
2. Interface: name (string), instructionText (string), applicableOperations (string[]), isDefault (boolean, default false), createdAt, updatedAt
3. Schema: name required, instructionText required (cap ~2000 chars per RESEARCH), applicableOperations array of strings (default ['*']), isDefault boolean default false, timestamps: true
4. Add CreateInstructionProfileSchema to schemas.ts: name z.string().min(1).max(100), instructionText z.string().min(1).max(2000), applicableOperations z.array(z.string()).optional(), isDefault z.boolean().optional()
5. Add UpdateInstructionProfileSchema = CreateInstructionProfileSchema.partial()
6. Export InstructionProfile; use mongoose.models check like Tag
  </action>
  <verify>npm run build</verify>
  <done>InstructionProfile model and schemas exist; can create document</done>
</task>

<task type="auto">
  <name>Task 2: Create CRUD API /api/instruction-profiles</name>
  <files>src/app/api/instruction-profiles/route.ts, src/app/api/instruction-profiles/[id]/route.ts</files>
  <action>
1. Create route.ts: GET list all profiles (sort by name), POST create with CreateInstructionProfileSchema validation
2. Create [id]/route.ts: GET by id, PUT update with UpdateInstructionProfileSchema, DELETE
3. Follow tags pattern: getServerSession() 401 if !session?.user?.email, connectToDatabase(), Types.ObjectId.isValid for [id]
4. On create: if isDefault true, unset isDefault on other profiles (only one default)
5. On PUT: same default-unique logic when isDefault set
  </action>
  <verify>curl -X GET /api/instruction-profiles returns 200; curl -X POST with body returns 201</verify>
  <done>CRUD API works; list, create, get, update, delete</done>
</task>

<task type="auto">
  <name>Task 3: Create getProfileInstruction helper</name>
  <files>src/lib/ai/instruction-profile.ts</files>
  <action>
1. Create src/lib/ai/instruction-profile.ts
2. Export async function getProfileInstruction(profileId: string | null | undefined): Promise&lt;string&gt;
3. If !profileId or invalid ObjectId, return ''
4. InstructionProfile.findById(profileId).select('instructionText').lean()
5. Return doc?.instructionText ?? ''
6. Connect to DB: use connectToDatabase() or rely on route-level connection (helper may be called from API routes that already connected — document that caller must ensure DB connected, or call connectToDatabase() inside helper for safety)
7. Use connectToDatabase() inside helper for robustness when called from AI libs
  </action>
  <verify>npm run build; getProfileInstruction(validId) returns instruction text</verify>
  <done>Helper returns instruction text for valid profileId, '' otherwise</done>
</task>

</tasks>

<verification>
- npm run build passes
- GET /api/instruction-profiles returns list
- POST /api/instruction-profiles with { name, instructionText } returns 201
- getProfileInstruction(profileId) returns instruction text
</verification>

<success_criteria>
- Model matches RESEARCH.md spec
- API follows tags CRUD pattern
- Helper safe for null/undefined/invalid id
</success_criteria>
