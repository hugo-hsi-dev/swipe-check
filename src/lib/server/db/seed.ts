/**
 * Database Seed Script
 * Populates the questions table with MBTI personality assessment questions
 *
 * Run with: pnpm db:seed
 */

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { questions } from './schema';
import type { Dimension } from './schema';

// Load environment variables
config();

// Create database connection for seeding
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL environment variable is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

/**
 * MBTI Question Bank
 * 80 questions total - 10 questions per dimension
 * Ensures even distribution across all 8 dimensions
 */
const mbtiQuestions: Array<{ text: string; targetDimension: Dimension }> = [
	// Extraversion (E) - 10 questions
	{
		text: 'I feel energized after spending time with a group of people',
		targetDimension: 'E'
	},
	{
		text: 'I prefer working in a team rather than working alone',
		targetDimension: 'E'
	},
	{
		text: 'I enjoy being the center of attention at social gatherings',
		targetDimension: 'E'
	},
	{
		text: 'I find it easy to start conversations with strangers',
		targetDimension: 'E'
	},
	{
		text: 'I prefer to think out loud and discuss ideas with others',
		targetDimension: 'E'
	},
	{
		text: 'I feel comfortable in large social gatherings',
		targetDimension: 'E'
	},
	{
		text: 'I actively seek out new social interactions',
		targetDimension: 'E'
	},
	{
		text: 'I prefer having many friends and acquaintances',
		targetDimension: 'E'
	},
	{
		text: 'I enjoy group activities more than solo activities',
		targetDimension: 'E'
	},
	{
		text: 'I get restless when I spend too much time alone',
		targetDimension: 'E'
	},

	// Introversion (I) - 10 questions
	{
		text: 'I need time alone to recharge after social activities',
		targetDimension: 'I'
	},
	{
		text: 'I prefer deep conversations with a few close friends over small talk with many people',
		targetDimension: 'I'
	},
	{
		text: 'I think carefully before speaking in group settings',
		targetDimension: 'I'
	},
	{
		text: 'I prefer to work independently rather than in teams',
		targetDimension: 'I'
	},
	{
		text: 'I find large social gatherings draining',
		targetDimension: 'I'
	},
	{
		text: 'I prefer written communication over face-to-face conversations',
		targetDimension: 'I'
	},
	{
		text: 'I enjoy spending time alone with my thoughts',
		targetDimension: 'I'
	},
	{
		text: 'I prefer a few close friendships over many casual friendships',
		targetDimension: 'I'
	},
	{
		text: 'I tend to listen more than I speak in social situations',
		targetDimension: 'I'
	},
	{
		text: 'I feel most creative when working alone',
		targetDimension: 'I'
	},

	// Sensing (S) - 10 questions
	{
		text: 'I focus on concrete facts and details rather than abstract concepts',
		targetDimension: 'S'
	},
	{
		text: 'I prefer practical solutions over theoretical possibilities',
		targetDimension: 'S'
	},
	{
		text: 'I trust my direct experience more than my intuition',
		targetDimension: 'S'
	},
	{
		text: 'I pay close attention to details and specifics',
		targetDimension: 'S'
	},
	{
		text: 'I prefer step-by-step instructions over general guidelines',
		targetDimension: 'S'
	},
	{
		text: 'I focus on what is happening now rather than future possibilities',
		targetDimension: 'S'
	},
	{
		text: 'I prefer proven methods over experimental approaches',
		targetDimension: 'S'
	},
	{
		text: 'I notice small details that others might miss',
		targetDimension: 'S'
	},
	{
		text: 'I prefer realistic and practical approaches to problems',
		targetDimension: 'S'
	},
	{
		text: 'I value tangible results over abstract ideas',
		targetDimension: 'S'
	},

	// Intuition (N) - 10 questions
	{
		text: 'I enjoy thinking about future possibilities and potential',
		targetDimension: 'N'
	},
	{
		text: 'I prefer to focus on the big picture rather than details',
		targetDimension: 'N'
	},
	{
		text: 'I trust my hunches and gut feelings',
		targetDimension: 'N'
	},
	{
		text: 'I enjoy exploring abstract concepts and theories',
		targetDimension: 'N'
	},
	{
		text: 'I prefer innovative approaches over traditional methods',
		targetDimension: 'N'
	},
	{
		text: 'I think about patterns and connections between ideas',
		targetDimension: 'N'
	},
	{
		text: 'I enjoy imagining different scenarios and possibilities',
		targetDimension: 'N'
	},
	{
		text: 'I prefer to understand underlying meanings rather than literal interpretations',
		targetDimension: 'N'
	},
	{
		text: 'I am more interested in what could be than what is',
		targetDimension: 'N'
	},
	{
		text: 'I enjoy brainstorming and generating creative ideas',
		targetDimension: 'N'
	},

	// Thinking (T) - 10 questions
	{
		text: 'I make decisions based on logic and objective analysis',
		targetDimension: 'T'
	},
	{
		text: 'I value truth and accuracy over tact and harmony',
		targetDimension: 'T'
	},
	{
		text: 'I prefer to remain detached and objective when making decisions',
		targetDimension: 'T'
	},
	{
		text: 'I focus on principles and rules rather than personal circumstances',
		targetDimension: 'T'
	},
	{
		text: 'I analyze situations critically and look for flaws',
		targetDimension: 'T'
	},
	{
		text: 'I prefer direct and frank communication',
		targetDimension: 'T'
	},
	{
		text: 'I believe fairness and justice are more important than mercy',
		targetDimension: 'T'
	},
	{
		text: 'I make decisions with my head rather than my heart',
		targetDimension: 'T'
	},
	{
		text: 'I value competence and efficiency highly',
		targetDimension: 'T'
	},
	{
		text: 'I prefer to address issues directly rather than worrying about feelings',
		targetDimension: 'T'
	},

	// Feeling (F) - 10 questions
	{
		text: 'I consider how decisions will affect people emotionally',
		targetDimension: 'F'
	},
	{
		text: 'I value harmony and cooperation in relationships',
		targetDimension: 'F'
	},
	{
		text: 'I make decisions based on my personal values and beliefs',
		targetDimension: 'F'
	},
	{
		text: "I am sensitive to other people's feelings and needs",
		targetDimension: 'F'
	},
	{
		text: 'I prefer to maintain harmony even if it means compromising on logic',
		targetDimension: 'F'
	},
	{
		text: 'I value empathy and compassion highly',
		targetDimension: 'F'
	},
	{
		text: 'I consider the human impact before making decisions',
		targetDimension: 'F'
	},
	{
		text: 'I prefer to be tactful rather than brutally honest',
		targetDimension: 'F'
	},
	{
		text: 'I believe showing appreciation and encouragement is important',
		targetDimension: 'F'
	},
	{
		text: 'I make decisions with my heart rather than my head',
		targetDimension: 'F'
	},

	// Judging (J) - 10 questions
	{
		text: 'I prefer to have a clear plan and schedule',
		targetDimension: 'J'
	},
	{
		text: 'I like to complete tasks well before deadlines',
		targetDimension: 'J'
	},
	{
		text: 'I feel more comfortable when things are organized and decided',
		targetDimension: 'J'
	},
	{
		text: 'I prefer structure and routine in my daily life',
		targetDimension: 'J'
	},
	{
		text: 'I make to-do lists and enjoy checking off completed tasks',
		targetDimension: 'J'
	},
	{
		text: 'I prefer to settle matters and reach closure quickly',
		targetDimension: 'J'
	},
	{
		text: 'I feel stressed when things are left open-ended or unfinished',
		targetDimension: 'J'
	},
	{
		text: 'I like having clear goals and deadlines',
		targetDimension: 'J'
	},
	{
		text: 'I prefer making decisions promptly rather than keeping options open',
		targetDimension: 'J'
	},
	{
		text: 'I feel satisfied when everything is neat and organized',
		targetDimension: 'J'
	},

	// Perceiving (P) - 10 questions
	{
		text: 'I prefer to keep my options open and be spontaneous',
		targetDimension: 'P'
	},
	{
		text: 'I enjoy being flexible and adapting to changing circumstances',
		targetDimension: 'P'
	},
	{
		text: 'I prefer to gather more information before making final decisions',
		targetDimension: 'P'
	},
	{
		text: 'I work well under pressure and often wait until the last minute',
		targetDimension: 'P'
	},
	{
		text: 'I prefer exploring multiple possibilities over following a single plan',
		targetDimension: 'P'
	},
	{
		text: 'I feel restricted by too much structure and routine',
		targetDimension: 'P'
	},
	{
		text: 'I enjoy the process of exploring options more than reaching conclusions',
		targetDimension: 'P'
	},
	{
		text: 'I prefer to go with the flow rather than stick to a schedule',
		targetDimension: 'P'
	},
	{
		text: 'I am comfortable with ambiguity and uncertainty',
		targetDimension: 'P'
	},
	{
		text: 'I prefer to respond to situations as they arise rather than planning ahead',
		targetDimension: 'P'
	}
];

/**
 * Main seed function
 * Clears existing questions and inserts new question bank
 */
async function seed() {
	console.log('🌱 Starting database seed...');
	console.log(`📝 Preparing to insert ${mbtiQuestions.length} MBTI questions`);

	// Verify even distribution
	const dimensionCounts: Record<Dimension, number> = {
		E: 0,
		I: 0,
		S: 0,
		N: 0,
		T: 0,
		F: 0,
		J: 0,
		P: 0
	};

	mbtiQuestions.forEach((q) => {
		dimensionCounts[q.targetDimension]++;
	});

	console.log('\n📊 Question distribution by dimension:');
	Object.entries(dimensionCounts).forEach(([dimension, count]) => {
		console.log(`   ${dimension}: ${count} questions`);
	});

	// Delete existing questions
	console.log('\n🗑️  Clearing existing questions...');
	await db.delete(questions);

	// Insert new questions
	console.log('✨ Inserting new questions...');
	await db.insert(questions).values(mbtiQuestions);

	console.log('\n✅ Seed completed successfully!');
	console.log(`   Total questions inserted: ${mbtiQuestions.length}`);

	// Close database connection
	await client.end();
	process.exit(0);
}

// Run seed
seed().catch(async (error) => {
	console.error('❌ Seed failed:', error);
	await client.end();
	process.exit(1);
});
