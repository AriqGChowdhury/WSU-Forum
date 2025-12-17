import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SUBFORUMS, 
  CATEGORY_LABELS, 
  USER_ROLES,
  ROLE_COLORS 
} from '@/constants';
import { 
  Plus, 
  Settings, 
  Users, 
  Shield, 
  Trash2, 
  Edit,
  MoreHorizontal,
  Lock,
  Unlock,
  Eye,
  Hash,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

export function AdminView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('subforums');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubforum, setEditingSubforum] = useState(null);

  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
          <h3 className="font-semibold mb-1">Admin Access Required</h3>
          <p className="text-zinc-500 text-sm">
            You don't have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-zinc-500">Manage sub-forums, users, and settings</p>
        </div>
        <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard 
          label="Total Sub-Forums" 
          value={SUBFORUMS.length} 
          icon={Hash}
          color="#0c5449"
        />
        <StatCard 
          label="Restricted Forums" 
          value={SUBFORUMS.filter(sf => sf.access && sf.access.length < 5).length} 
          icon={Lock}
          color="#f59e0b"
        />
        <StatCard 
          label="Total Users" 
          value="1,234" 
          icon={Users}
          color="#3b82f6"
        />
        <StatCard 
          label="Reports" 
          value="5" 
          icon={AlertTriangle}
          color="#ef4444"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subforums">Sub-Forums</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Sub-Forums Tab */}
        <TabsContent value="subforums" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Manage Sub-Forums</h2>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-Forum
            </Button>
          </div>

          {/* Sub-Forums List */}
          <div className="space-y-3">
            {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => {
              const forums = SUBFORUMS.filter(sf => sf.category === catKey);
              if (forums.length === 0) return null;

              return (
                <Card key={catKey}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      {catInfo.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {forums.map(forum => (
                      <SubForumRow 
                        key={forum.id} 
                        forum={forum}
                        onEdit={() => setEditingSubforum(forum)}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Role Permissions Tab */}
        <TabsContent value="roles" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure what each role can do across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(USER_ROLES).map(([key, roleName]) => {
                  const colors = ROLE_COLORS[roleName];
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border,
                          }}
                        >
                          {roleName}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 pl-4">
                        <PermissionToggle 
                          label="Can create posts" 
                          defaultChecked={true} 
                        />
                        <PermissionToggle 
                          label="Can create events" 
                          defaultChecked={roleName !== 'Student'} 
                        />
                        <PermissionToggle 
                          label="Can post announcements" 
                          defaultChecked={['Faculty', 'Staff', 'Admin'].includes(roleName)} 
                        />
                        <PermissionToggle 
                          label="Can moderate content" 
                          defaultChecked={['Staff', 'Admin'].includes(roleName)} 
                        />
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reported Content</CardTitle>
              <CardDescription>
                Review and take action on reported posts and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-zinc-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                <p>No pending reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Sub-Forum Dialog */}
      <CreateSubForumDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Sub-Forum Dialog */}
      {editingSubforum && (
        <EditSubForumDialog 
          forum={editingSubforum}
          open={!!editingSubforum} 
          onOpenChange={(open) => !open && setEditingSubforum(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubForumRow({ forum, onEdit }) {
  const isRestricted = forum.access && forum.access.length < 5;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition">
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: forum.color + '20' }}
        >
          <Hash className="h-4 w-4" style={{ color: forum.color }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{forum.name}</span>
            {isRestricted && (
              <Lock className="h-3 w-3 text-zinc-400" />
            )}
          </div>
          <p className="text-xs text-zinc-500">{forum.description}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Eye className="h-4 w-4 mr-2" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PermissionToggle({ label, defaultChecked }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function CreateSubForumDialog({ open, onOpenChange }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sub-Forum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Physics"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this sub-forum about?"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[var(--wsu-green)]">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditSubForumDialog({ forum, open, onOpenChange }) {
  const [name, setName] = useState(forum.name);
  const [description, setDescription] = useState(forum.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sub-Forum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Access</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.values(USER_ROLES).map(role => (
                <Badge 
                  key={role}
                  variant={forum.access?.includes(role) ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[var(--wsu-green)]">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdminView;
