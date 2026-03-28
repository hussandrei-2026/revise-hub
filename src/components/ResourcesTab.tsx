import React, { useState } from 'react';

interface Resource {
  id: string;
  name: string;
  url: string;
  subjects: string[];
  category: 'videos' | 'practice' | 'notes' | 'tools';
  icon: string;
  description: string;
  rating: number; // 1-5
}

const RESOURCES: Resource[] = [
  // Maths Resources
  {
    id: 'maths-genie',
    name: 'Maths Genie',
    url: 'https://www.mathsgenie.co.uk/',
    subjects: ['maths'],
    category: 'videos',
    icon: '🎥',
    description: 'Free GCSE Maths video tutorials for all topics with instant answers',
    rating: 5
  },
  {
    id: 'piximaths',
    name: 'Piximaths',
    url: 'https://www.piximaths.co.uk/',
    subjects: ['maths'],
    category: 'videos',
    icon: '🎬',
    description: 'Pixl GCSE Maths video tutorials covering all exam boards',
    rating: 5
  },
  {
    id: 'maths-drills',
    name: 'Maths Drills',
    url: 'https://www.mathsdrills.com/',
    subjects: ['maths'],
    category: 'practice',
    icon: '📝',
    description: 'Unlimited math practice problems with instant feedback',
    rating: 4
  },

  // Physics Resources
  {
    id: 'physics-maths-tutor',
    name: 'Physics & Maths Tutor',
    url: 'https://www.thephysicstutor.com/',
    subjects: ['physics', 'maths'],
    category: 'notes',
    icon: '📚',
    description: 'Comprehensive physics and maths study guides and revision notes',
    rating: 5
  },
  {
    id: 'seneca',
    name: 'Seneca Learning',
    url: 'https://www.senecalearning.com/',
    subjects: ['physics', 'maths', 'chemistry', 'biology', 'english'],
    category: 'videos',
    icon: '🎓',
    description: 'Personalized online learning platform with instant feedback',
    rating: 5
  },
  {
    id: 'crash-course',
    name: 'Crash Course Physics',
    url: 'https://www.youtube.com/channel/UCiEL7GtBj4ruUf0dUGHmYEA',
    subjects: ['physics'],
    category: 'videos',
    icon: '▶️',
    description: 'Educational physics videos explaining complex concepts clearly',
    rating: 4
  },

  // Science Resources
  {
    id: 'access-tuition',
    name: 'Access Tuition',
    url: 'https://www.accesstuition.com/',
    subjects: ['physics', 'chemistry', 'biology', 'maths'],
    category: 'videos',
    icon: '👨‍🏫',
    description: 'Expert GCSE tutoring videos for all sciences and maths',
    rating: 5
  },
  {
    id: 'aqa-students',
    name: 'AQA GCSE Resources',
    url: 'https://www.aqa.org.uk/students',
    subjects: ['maths', 'physics', 'chemistry', 'biology'],
    category: 'notes',
    icon: '📋',
    description: 'Official AQA specification guides and practice resources',
    rating: 5
  },
  {
    id: 'mme-revise',
    name: 'MME Revise',
    url: 'https://www.mmerevise.co.uk/',
    subjects: ['maths', 'physics', 'chemistry'],
    category: 'practice',
    icon: '✏️',
    description: 'Past paper questions organized by topic with worked solutions',
    rating: 5
  },

  // English Resources
  {
    id: 'bbc-english',
    name: 'BBC Bitesize English',
    url: 'https://www.bbc.co.uk/bitesize/subjects/zen8d2p',
    subjects: ['english'],
    category: 'notes',
    icon: '📖',
    description: 'BBC Bitesize guides for English language and literature',
    rating: 5
  },
  {
    id: 'sparknotes',
    name: 'SparkNotes',
    url: 'https://www.sparknotes.com/',
    subjects: ['english'],
    category: 'notes',
    icon: '📚',
    description: 'Character guides and plot summaries for English texts',
    rating: 4
  },

  // General / Multi-Subject
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org/',
    subjects: ['maths', 'physics', 'chemistry'],
    category: 'videos',
    icon: '🎥',
    description: 'Free educational videos explaining topics from basics to advanced',
    rating: 5
  },
  {
    id: 'tuition-kit',
    name: 'Tuition Kit',
    url: 'https://www.tuitionkit.com/',
    subjects: ['maths', 'physics', 'english'],
    category: 'practice',
    icon: '🎯',
    description: 'Curated practice questions and model answers',
    rating: 4
  },
  {
    id: 'revision-buddies',
    name: 'Revision Buddies',
    url: 'https://www.revisionbuddies.co.uk/',
    subjects: ['maths'],
    category: 'practice',
    icon: '👥',
    description: 'Group study platform for collaborative revision',
    rating: 4
  }
];

interface ResourcesTabProps {
  userSubjects?: string[];
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ userSubjects = ['maths', 'physics', 'english'] }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique subjects and categories
  const allSubjects = ['all', ...new Set(RESOURCES.flatMap(r => r.subjects))];
  const allCategories = ['all', ...new Set(RESOURCES.map(r => r.category))];

  // Filter resources
  const filteredResources = RESOURCES.filter(resource => {
    const subjectMatch = selectedSubject === 'all' || resource.subjects.includes(selectedSubject);
    const categoryMatch = selectedCategory === 'all' || resource.category === selectedCategory;
    return subjectMatch && categoryMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'videos':
        return '🎥';
      case 'practice':
        return '📝';
      case 'notes':
        return '📚';
      case 'tools':
        return '🔧';
      default:
        return '📌';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getSubjectLabel = (subject: string) => {
    return subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="resources-content">
      <h2>🔗 Study Resources</h2>
      <p className="resources-intro">
        Curated collection of free GCSE study materials including videos, practice questions, and revision notes.
      </p>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Subject:</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            {allSubjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : getSubjectLabel(subject)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {allCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Types' : getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filteredResources.map(resource => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-header">
              <div className="resource-icon">{resource.icon}</div>
              <div className="resource-title">{resource.name}</div>
            </div>

            <div className="resource-description">
              {resource.description}
            </div>

            <div className="resource-meta">
              <div className="resource-category">
                {getCategoryIcon(resource.category)} {getCategoryLabel(resource.category)}
              </div>
              <div className="resource-rating">
                {'⭐'.repeat(resource.rating)}<span className="rating-count">{resource.rating}</span>
              </div>
            </div>

            <div className="resource-subjects">
              {resource.subjects.map(subject => (
                <span key={subject} className="subject-badge">
                  {getSubjectLabel(subject)}
                </span>
              ))}
            </div>

            <div className="resource-visit">
              Visit Website →
            </div>
          </a>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="empty-state">
          <p>No resources found matching your filters</p>
          <p>Try adjusting your selections</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 How to Use These Resources</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📚</div>
            <h4>Study Notes</h4>
            <p>Use comprehensive revision guides to understand topics before practicing questions</p>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🎥</div>
            <h4>Watch Videos</h4>
            <p>Visual explanations help understand complex concepts. Watch at 1.5x speed to save time</p>
          </div>

          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h4>Practice Questions</h4>
            <p>Do practice questions after learning. Start with easier questions, progress to harder ones</p>
          </div>

          <div className="tip-card">
            <div className="tip-icon">⏱️</div>
            <h4>Timed Practice</h4>
            <p>Practice under timed conditions to get used to exam pace and pressure</p>
          </div>
        </div>
      </div>

      {/* Study Schedule */}
      <div className="study-schedule">
        <h3>🗓️ Recommended Study Schedule</h3>
        <div className="schedule-table">
          <div className="schedule-row header">
            <div className="schedule-col">Week</div>
            <div className="schedule-col">Focus</div>
            <div className="schedule-col">Resource Type</div>
          </div>
          <div className="schedule-row">
            <div className="schedule-col">1-2</div>
            <div className="schedule-col">Learn new topics</div>
            <div className="schedule-col">📚 Study notes + 🎥 Videos</div>
          </div>
          <div className="schedule-row">
            <div className="schedule-col">3-4</div>
            <div className="schedule-col">Practice basics</div>
            <div className="schedule-col">📝 Easy practice questions</div>
          </div>
          <div className="schedule-row">
            <div className="schedule-col">5-6</div>
            <div className="schedule-col">Challenge yourself</div>
            <div className="schedule-col">📝 Harder practice questions</div>
          </div>
          <div className="schedule-row">
            <div className="schedule-col">7-8</div>
            <div className="schedule-col">Full exam simulation</div>
            <div className="schedule-col">📄 Past papers under time pressure</div>
          </div>
        </div>
      </div>
    </div>
  );
};
