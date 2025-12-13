import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SUBFORUMS, 
  CATEGORY_LABELS, 
  getAccessibleSubforums,
  getSubforumsByCategory,
  canPostInSubforum 
} from '@/constants';
import { 
  Search, 
  Users, 
  MessageSquare, 
  Lock,
  Code,
  Cog,
  Briefcase,
  Heart,
  Palette,
  Home,
  UtensilsCrossed,
  Trophy,
  GraduationCap,
  FileText,
  Megaphone,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  UserPlus,
  Sparkles,
  Coffee,
  FolderOpen,
  Globe,
  Building,
  Shield,
  UserCheck,
  ChevronRight
} from 'lucide-react';

// Icon mapping
const ICONS = {
  Code, Cog, Briefcase, Heart, Palette, Home, UtensilsCrossed, Trophy,
  GraduationCap, FileText, Megaphone, ShoppingBag, MessageCircle,
  BookOpen, UserPlus, Sparkles, Coffee, FolderOpen, Globe, Building,
  Shield, UserCheck, Users
};

export function SubForumsView({ onSelectSubforum }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const userRole = user?.role || 'Student';
  const accessibleSubforums = getAccessibleSubforums(userRole);

  // Filter by search
  const filteredSubforums = accessibleSubforums.filter(sf =>
    sf.name.toLowerCase().includes(search.toLowerCase()) ||
    sf.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sub-Forums</h1>
        <p className="text-zinc-500">Browse communities by topic or interest</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search sub-forums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-[var(--wsu-green)] data-[state=active]:text-white"
          >
            All
          </TabsTrigger>
          {categories.map(cat => {
            const catInfo = CATEGORY_LABELS[cat];
            const count = getSubforumsByCategory(cat, userRole).length;
            if (count === 0) return null;
            return (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="data-[state=active]:bg-[var(--wsu-green)] data-[state=active]:text-white"
              >
                {catInfo.name}
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All Forums */}
        <TabsContent value="all" className="mt-6 space-y-8">
          {categories.map(cat => {
            const subforums = getSubforumsByCategory(cat, userRole);
            if (subforums.length === 0) return null;
            const catInfo = CATEGORY_LABELS[cat];
            
            return (
              <CategorySection
                key={cat}
                category={catInfo}
                subforums={search ? subforums.filter(sf => 
                  sf.name.toLowerCase().includes(search.toLowerCase()) ||
                  sf.description.toLowerCase().includes(search.toLowerCase())
                ) : subforums}
                userRole={userRole}
                onSelect={onSelectSubforum}
              />
            );
          })}
        </TabsContent>

        {/* Individual Category Tabs */}
        {categories.map(cat => {
          const subforums = search 
            ? filteredSubforums.filter(sf => sf.category === cat)
            : getSubforumsByCategory(cat, userRole);
          
          if (subforums.length === 0) return null;
          
          return (
            <TabsContent key={cat} value={cat} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subforums.map(subforum => (
                  <SubforumCard
                    key={subforum.id}
                    subforum={subforum}
                    userRole={userRole}
                    onClick={() => onSelectSubforum(subforum)}
                  />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* No Results */}
      {search && filteredSubforums.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
            <h3 className="font-semibold mb-1">No sub-forums found</h3>
            <p className="text-zinc-500 text-sm">
              Try a different search term
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Category Section Component
function CategorySection({ category, subforums, userRole, onSelect }) {
  if (subforums.length === 0) return null;

  const IconComponent = ICONS[category.icon] || Globe;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          <IconComponent className="h-4 w-4" style={{ color: category.color }} />
        </div>
        <h2 className="text-lg font-semibold">{category.name}</h2>
        <Badge variant="outline">{subforums.length}</Badge>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subforums.map(subforum => (
          <SubforumCard
            key={subforum.id}
            subforum={subforum}
            userRole={userRole}
            onClick={() => onSelect(subforum)}
          />
        ))}
      </div>
    </div>
  );
}

// Subforum Card Component
function SubforumCard({ subforum, userRole, onClick }) {
  const IconComponent = ICONS[subforum.icon] || MessageCircle;
  const canPost = canPostInSubforum(userRole, subforum);
  const isRestricted = subforum.access && subforum.access.length < 5;

  // Mock stats - would come from API
  const stats = {
    members: Math.floor(Math.random() * 500) + 50,
    posts: Math.floor(Math.random() * 200) + 10,
  };

  return (
    <Card 
      className="hover:shadow-md transition cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: subforum.color + '15' }}
          >
            <IconComponent 
              className="h-6 w-6" 
              style={{ color: subforum.color }} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{subforum.name}</h3>
              {isRestricted && (
                <Lock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2 mt-0.5">
              {subforum.description}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stats.members}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {stats.posts}
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 transition flex-shrink-0" />
        </div>

        {!canPost && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              View only - posting restricted
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubForumsView;