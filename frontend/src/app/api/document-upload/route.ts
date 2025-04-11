import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const formData = await request.formData()
    const file = formData.get('file') as File
    const teamId = formData.get('teamId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!teamId) {
      return NextResponse.json({ error: 'No team ID provided' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${teamId}/${file.name}`, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Create document record in database
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert([
        {
          team_id: teamId,
          name: file.name,
          storage_path: uploadData.path,
          uploaded_by: user.id,
        },
      ])
      .select()
      .single()

    if (documentError) {
      return NextResponse.json({ error: documentError.message }, { status: 500 })
    }

    return NextResponse.json(documentData)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 