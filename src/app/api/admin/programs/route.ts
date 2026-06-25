import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

const DEFAULT_PROGRAMS = [
  { id: 'coding',   name: 'Coding & Programming',                  description: 'Learn the fundamentals of programming through hands-on projects.',           icon: 'Code',       color: 'from-blue-500 to-cyan-500',     isFree: false, isLimited: false, order: 1  },
  { id: 'robotics', name: 'Robotics Engineering',                  description: 'Build and program robots using sensors, motors and microcontrollers.',       icon: 'Bot',        color: 'from-purple-500 to-pink-500',   isFree: false, isLimited: false, order: 2  },
  { id: 'ai',       name: 'Artificial Intelligence',               description: 'Explore machine learning, neural networks and AI applications.',             icon: 'Brain',      color: 'from-green-500 to-emerald-500', isFree: false, isLimited: false, order: 3  },
  { id: 'web',      name: 'Web Development',                       description: 'Design and build modern websites with HTML, CSS, JavaScript and React.',     icon: 'Globe',      color: 'from-indigo-500 to-blue-500',   isFree: false, isLimited: false, order: 4  },
  { id: 'mobile',   name: 'Mobile App Development',                description: 'Create iOS and Android apps using modern cross-platform frameworks.',        icon: 'Smartphone', color: 'from-orange-500 to-red-500',    isFree: false, isLimited: false, order: 5  },
  { id: 'game',     name: 'Game Development',                      description: 'Design and code 2D/3D games using Unity and game design principles.',        icon: 'Gamepad2',   color: 'from-pink-500 to-rose-500',     isFree: false, isLimited: false, order: 6  },
  { id: '3d',       name: '3D Design & Modeling',                  description: 'Master 3D modeling, animation and rendering with industry tools.',           icon: 'Box',        color: 'from-yellow-500 to-orange-500', isFree: false, isLimited: false, order: 7  },
  { id: 'graphic',  name: 'Graphic Design',                        description: 'Create stunning visuals, logos, and digital art with design software.',      icon: 'Palette',    color: 'from-violet-500 to-purple-500', isFree: false, isLimited: false, order: 8  },
  { id: 'digital',  name: 'Digital Literacy',                      description: 'Develop essential computer skills, online safety, and productivity tools.',  icon: 'Monitor',    color: 'from-teal-500 to-cyan-500',     isFree: false, isLimited: false, order: 9  },
  { id: 'scratch',  name: 'Scratch Programming',                   description: 'Introduction to coding using Scratch — perfect for beginners aged 6–12.',   icon: 'Sparkles',   color: 'from-amber-500 to-yellow-500',  isFree: false, isLimited: false, order: 10 },
  { id: 'workshop', name: 'FREE ONLINE KIDS APP CREATOR WORKSHOP', description: 'A free online workshop where kids build their first app. Coupon required.',  icon: 'Gift',       color: 'from-emerald-500 to-green-500', isFree: true,  isLimited: true,  order: 11 },
];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    let programs = await Program.find({}).sort({ order: 1, createdAt: 1 }).lean();

    // Seed defaults if collection is empty
    if (programs.length === 0) {
      await Program.insertMany(DEFAULT_PROGRAMS);
      programs = await Program.find({}).sort({ order: 1, createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error('Programs GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, color, icon, isFree, isLimited } = body;

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ success: false, message: 'Name and description are required' }, { status: 400 });
    }

    await connectDB();

    // Auto-generate ID from name
    const baseId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let id = baseId;
    let suffix = 1;
    while (await Program.findOne({ id })) {
      id = `${baseId}-${suffix++}`;
    }

    const maxOrder = await Program.findOne({}).sort({ order: -1 }).select('order').lean();
    const nextOrder = ((maxOrder as { order?: number } | null)?.order ?? 0) + 1;

    const program = await Program.create({
      id,
      name: name.trim(),
      description: description.trim(),
      color: color ?? 'from-indigo-500 to-purple-600',
      icon: icon ?? 'Code',
      isFree: isFree ?? false,
      isLimited: isLimited ?? false,
      isActive: true,
      order: nextOrder,
    });

    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch (error) {
    console.error('Programs POST error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
