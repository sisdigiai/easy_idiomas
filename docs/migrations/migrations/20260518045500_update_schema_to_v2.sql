-- Create lesson_plans table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    source TEXT CHECK (source IN ('manual', 'ai_assisted')) DEFAULT 'manual',
    title TEXT,
    objective TEXT,
    agenda JSONB,
    warmup_activity TEXT,
    main_activity TEXT,
    practice_activity TEXT,
    homework TEXT,
    teacher_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('draft', 'approved', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_suggestions table
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by UUID REFERENCES public.profiles(id),
    lesson_id UUID REFERENCES public.lessons(id),
    class_id UUID REFERENCES public.classes(id),
    suggestion_type TEXT CHECK (suggestion_type IN ('lesson_plan', 'activity', 'material', 'homework', 'teacher_note')),
    prompt_input JSONB,
    suggestion_output JSONB,
    status TEXT CHECK (status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create class_schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    weekday INTEGER CHECK (weekday >= 0 AND weekday <= 6),
    start_time TIME,
    end_time TIME,
    room TEXT,
    lesson_type TEXT CHECK (lesson_type IN ('presential', 'online')),
    online_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update lessons table
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS online_url TEXT,
ADD COLUMN IF NOT EXISTS lesson_objective TEXT,
ADD COLUMN IF NOT EXISTS topic TEXT;

-- Enable RLS logic for later use
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
