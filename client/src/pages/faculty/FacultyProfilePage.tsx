import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import {
  FileUploadField,
  FormSection,
  MultiSelectField,
  SegmentedControl,
  SelectField,
  TextField,
} from '../../components/faculty-registration/RegistrationFields'
import { facultyRegistrationOptions } from '../../constants/facultyRegistrationOptions'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024
const MAX_RESUME_SIZE = 5 * 1024 * 1024
const MAX_BIO_LENGTH = 500
const imageExtensions = /\.(png|jpe?g|gif|webp|bmp)$/i
const resumeExtensions = ['pdf', 'doc', 'docx']
const resumeMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const photoSchema = z
  .custom<File | null>((value) => value === null || value instanceof File, 'Choose a valid image file.')
  .refine((file) => !file || file.type.startsWith('image/') || (!file.type && imageExtensions.test(file.name)), {
    message: 'Choose an image file.',
  })
  .refine((file) => !file || file.size <= MAX_PHOTO_SIZE, {
    message: 'The profile photo must be 2 MB or smaller.',
  })

const resumeSchema = z
  .custom<File | null>((value) => value === null || value instanceof File, 'Choose a valid resume file.')
  .refine((file) => {
    if (!file) return true
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    return resumeExtensions.includes(extension) && (
      !file.type || file.type === 'application/octet-stream' || resumeMimeTypes.includes(file.type)
    )
  }, {
    message: 'Upload a PDF, DOC, or DOCX file.',
  })
  .refine((file) => !file || file.size <= MAX_RESUME_SIZE, {
    message: 'The resume must be 5 MB or smaller.',
  })

const facultyProfileSchema = z.object({
  gender: z.string().min(1, 'Select your gender.'),
  photo: photoSchema,
  department: z.string().min(1, 'Select your department.'),
  designation: z.string().min(1, 'Select your designation.'),
  qualification: z.string().trim().min(1, 'Enter your qualification.'),
  specialization: z.string().trim().min(1, 'Enter your specialization.'),
  yearsExperience: z.string()
    .min(1, 'Enter your years of experience.')
    .refine((value) => /^\d+(\.\d+)?$/.test(value) && Number(value) >= 0, 'Enter a non-negative number.'),
  subjects: z.array(z.string()).min(1, 'Choose at least one subject or course.'),
  teachingType: z.string().min(1, 'Choose a preferred teaching type.'),
  divisions: z.array(z.string()).min(1, 'Choose at least one division.'),
  batches: z.array(z.string()).min(1, 'Choose at least one batch.'),
  bio: z.string().max(MAX_BIO_LENGTH, `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`),
  resume: resumeSchema,
})

type FacultyProfileValues = z.infer<typeof facultyProfileSchema>

const defaultValues: FacultyProfileValues = {
  gender: '',
  photo: null,
  department: '',
  designation: '',
  qualification: '',
  specialization: '',
  yearsExperience: '',
  subjects: [],
  teachingType: '',
  divisions: [],
  batches: [],
  bio: '',
  resume: null,
}

const samplePreviewData = [
  { label: 'Name', value: 'Sample Faculty' },
  { label: 'PRN', value: 'PRN-2026-001' },
  { label: 'Email', value: 'faculty.preview@zeal.edu.in' },
  { label: 'Mobile', value: '+91 98765 43210' },
]

export default function FacultyProfilePage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [showPreviewNotice, setShowPreviewNotice] = useState(false)
  const submitTimerRef = useRef<number | null>(null)

  const {
    register,
    control,
    watch,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FacultyProfileValues>({
    resolver: zodResolver(facultyProfileSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  const values = watch()
  const photo = values.photo

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(photo)
    setPhotoPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [photo])

  useEffect(() => () => {
    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current)
  }, [])

  const completionFields = [
    Boolean(values.gender.trim()),
    Boolean(values.department.trim()),
    Boolean(values.designation.trim()),
    Boolean(values.qualification.trim()),
    Boolean(values.specialization.trim()),
    Boolean(values.yearsExperience.trim() && /^\d+(\.\d+)?$/.test(values.yearsExperience) && Number(values.yearsExperience) >= 0),
    values.subjects.length > 0,
    Boolean(values.teachingType),
    values.divisions.length > 0,
    values.batches.length > 0,
  ]
  const completedFields = completionFields.filter(Boolean).length
  const completionPercentage = Math.round((completedFields / completionFields.length) * 100)

  const handleValidSubmit = () => {
    setShowPreviewNotice(false)
    setIsPreviewLoading(true)
    submitTimerRef.current = window.setTimeout(() => {
      submitTimerRef.current = null
      setIsPreviewLoading(false)
      setShowPreviewNotice(true)
    }, 700)
  }

  const handleInvalidSubmit = (formErrors: FieldErrors<FacultyProfileValues>) => {
    const firstError = Object.keys(formErrors)[0] as keyof FacultyProfileValues | undefined
    if (!firstError) return

    const field = document.getElementById(firstError)
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (field instanceof HTMLElement) {
      field.focus({ preventScroll: true })
      return
    }
    setFocus(firstError)
  }

  const clearForm = () => {
    if (submitTimerRef.current !== null) {
      window.clearTimeout(submitTimerRef.current)
      submitTimerRef.current = null
    }
    setIsPreviewLoading(false)
    setShowPreviewNotice(false)
    reset(defaultValues)
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-6 text-[#1A2B5F] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
            ZEAL COLLEGE OF ENGINEERING &amp; RESEARCH
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#1A2B5F] sm:text-3xl">Complete Your Faculty Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Add your academic and teaching details to complete your profile.</p>
        </header>

        <section aria-labelledby="sample-preview-heading" className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:max-w-xl">
              <h2 id="sample-preview-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sample preview data
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {samplePreviewData.map(({ label, value }) => (
                  <div key={label} className="flex min-w-0 items-baseline gap-2 text-sm">
                    <dt className="shrink-0 text-slate-500">{label}:</dt>
                    <dd className="truncate font-medium text-[#1A2B5F]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="w-full lg:max-w-sm">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#1A2B5F]">Profile completion</span>
                <span className="font-medium text-[#1D6FE2]">{completionPercentage}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Required profile fields completed"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPercentage}
                className="h-2.5 overflow-hidden rounded-full bg-[#EBF0FA]"
              >
                <div
                  className="h-full rounded-full bg-[#1D6FE2] transition-[width] duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-[11px] text-slate-500">
                {completedFields} of {completionFields.length} required fields complete
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)} noValidate>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <FormSection title="A. Personal Information" description="Add your personal details and profile photo.">
              <SelectField
                id="gender"
                label="Gender"
                registration={register('gender')}
                options={facultyRegistrationOptions.gender}
                error={errors.gender?.message}
                required
              />
              <Controller
                name="photo"
                control={control}
                render={({ field }) => (
                  <FileUploadField
                    id="photo"
                    label="Profile Photo"
                    file={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    accept="image/*"
                    error={errors.photo?.message}
                    hint="Optional · Image file, maximum 2 MB."
                    preview={photoPreview ? (
                      <img src={photoPreview} alt="Profile photo preview" className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover" />
                    ) : undefined}
                  />
                )}
              />
            </FormSection>

            <FormSection title="B. Academic Information" description="Tell us about your academic background.">
              <SelectField
                id="department"
                label="Department"
                registration={register('department')}
                options={facultyRegistrationOptions.departments}
                error={errors.department?.message}
                required
              />
              <SelectField
                id="designation"
                label="Designation"
                registration={register('designation')}
                options={facultyRegistrationOptions.designations}
                error={errors.designation?.message}
                required
              />
              <TextField
                id="qualification"
                label="Qualification"
                registration={register('qualification')}
                error={errors.qualification?.message}
                required
                placeholder="e.g. M.E. Computer Engineering"
              />
              <TextField
                id="specialization"
                label="Specialization"
                registration={register('specialization')}
                error={errors.specialization?.message}
                required
                placeholder="e.g. Artificial Intelligence"
              />
              <TextField
                id="yearsExperience"
                label="Years of Experience"
                type="number"
                registration={register('yearsExperience')}
                error={errors.yearsExperience?.message}
                required
                min={0}
                step={0.5}
                placeholder="e.g. 4"
              />
            </FormSection>

            <FormSection title="C. Teaching Information" description="Choose the subjects and student groups you prefer to teach.">
              <Controller
                name="subjects"
                control={control}
                render={({ field }) => (
                  <MultiSelectField
                    id="subjects"
                    label="Subjects / Courses"
                    options={facultyRegistrationOptions.subjects}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.subjects?.message}
                    required
                  />
                )}
              />
              <Controller
                name="teachingType"
                control={control}
                render={({ field }) => (
                  <SegmentedControl
                    id="teachingType"
                    label="Preferred Teaching Type"
                    options={facultyRegistrationOptions.teachingTypes}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.teachingType?.message}
                    required
                  />
                )}
              />
              <Controller
                name="divisions"
                control={control}
                render={({ field }) => (
                  <MultiSelectField
                    id="divisions"
                    label="Preferred Divisions"
                    options={facultyRegistrationOptions.divisions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.divisions?.message}
                    required
                  />
                )}
              />
              <Controller
                name="batches"
                control={control}
                render={({ field }) => (
                  <MultiSelectField
                    id="batches"
                    label="Preferred Batches"
                    options={facultyRegistrationOptions.batches}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.batches?.message}
                    required
                  />
                )}
              />
            </FormSection>

            <FormSection
              title="D. Additional Information"
              description="Add a brief introduction and an optional resume."
              className="lg:col-span-2"
            >
              <div>
                <label htmlFor="bio" className="mb-1.5 block text-xs font-medium text-slate-600">
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  maxLength={MAX_BIO_LENGTH}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? 'bio-error' : 'bio-hint'}
                  placeholder="Briefly introduce your teaching and academic interests."
                  className={`input-field min-h-28 resize-y ${errors.bio ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.bio ? (
                    <p id="bio-error" className="text-xs text-red-600" role="alert">{errors.bio.message}</p>
                  ) : (
                    <span id="bio-hint" className="text-xs text-slate-500">Optional · Up to {MAX_BIO_LENGTH} characters.</span>
                  )}
                  <p className="ml-auto shrink-0 text-xs text-slate-500">{values.bio.length}/{MAX_BIO_LENGTH}</p>
                </div>
              </div>
              <Controller
                name="resume"
                control={control}
                render={({ field }) => (
                  <FileUploadField
                    id="resume"
                    label="Upload Resume / CV"
                    file={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    error={errors.resume?.message}
                    hint="Optional · PDF, DOC, or DOCX, maximum 5 MB."
                  />
                )}
              />
            </FormSection>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={clearForm}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE2]"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isPreviewLoading}
              className="btn-primary flex min-h-12 items-center justify-center gap-2 sm:w-auto sm:min-w-44"
            >
              {isPreviewLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                  Checking details...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>

        {showPreviewNotice && (
          <div role="status" aria-live="polite" className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-[#1A2B5F] shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1D6FE2]" aria-hidden="true" />
            <p><span className="font-semibold">UI preview only:</span> profile is not saved to the server yet.</p>
          </div>
        )}

        <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs leading-relaxed text-slate-500">
          <p className="font-medium text-[#1A2B5F]">Zeal College of Engineering &amp; Research, Pune</p>
          <p className="mt-1">Faculty portal · Timetable Management System</p>
        </footer>
      </div>
    </div>
  )
}
