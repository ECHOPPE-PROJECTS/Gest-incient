export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role | null;
  department: Department | null;
  phone: string;
  photo: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Stats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

export interface IncidentSummary {
  id: number;
  numero_ticket: string;
  title: string;
  status: { name: string };
  priority: { name: string; level: number };
  created_at: string;
  category?: { name: string };
}

export interface IncidentDetail extends IncidentSummary {
  description: string;
  author: { first_name: string; last_name: string };
  technician: { first_name: string; last_name: string } | null;
  comments: Comment[];
  resolved_at: string | null;
  closed_at: string | null;
}

export interface Comment {
  id: number;
  author: { first_name: string; last_name: string };
  content: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
  level: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Discussion {
  id: number;
  title: string;
  participants: User[];
  created_at: string;
  last_message: Message | null;
  messages_count: number;
}

export interface Message {
  id: number;
  user: User;
  discussion: number;
  content: string;
  created_at: string;
}
