import React, { createContext, useContext, useState, useEffect } from 'react';
import { orgApi, projectApi } from '../api/client';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load organizations on auth
  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setCurrentOrg(null);
      setProjects([]);
      setCurrentProject(null);
      return;
    }

    loadOrganizations();
  }, [isAuthenticated]);

  // Load projects whenever active organization changes
  useEffect(() => {
    if (currentOrg?.id) {
      loadProjects(currentOrg.id);
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [currentOrg?.id]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const res = await orgApi.list();
      const orgList = res.data?.data?.data || res.data?.data || [];
      const list = Array.isArray(orgList) ? orgList : [];
      setOrganizations(list);

      // Restore saved organization or select first
      const savedOrgId = localStorage.getItem('ff_active_org_id');
      const matched = list.find((o) => o.id === savedOrgId);
      if (matched) {
        setCurrentOrg(matched);
      } else if (list.length > 0) {
        setCurrentOrg(list[0]);
        localStorage.setItem('ff_active_org_id', list[0].id);
      } else {
        setCurrentOrg(null);
      }
    } catch (err) {
      console.warn('Failed to load organizations:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (orgId) => {
    try {
      const res = await projectApi.list(orgId);
      const projList = res.data?.data || [];
      const list = Array.isArray(projList) ? projList : [];
      setProjects(list);

      const savedProjId = localStorage.getItem('ff_active_project_id');
      const matched = list.find((p) => p.id === savedProjId);
      if (matched) {
        setCurrentProject(matched);
      } else if (list.length > 0) {
        setCurrentProject(list[0]);
        localStorage.setItem('ff_active_project_id', list[0].id);
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      console.warn('Failed to load projects for organization:', err?.message);
      setProjects([]);
      setCurrentProject(null);
    }
  };

  const switchOrg = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('ff_active_org_id', org.id);
  };

  const switchProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('ff_active_project_id', project.id);
    } else {
      localStorage.removeItem('ff_active_project_id');
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        organizations,
        currentOrg,
        projects,
        currentProject,
        loading,
        switchOrg,
        switchProject,
        refreshOrganizations: loadOrganizations,
        refreshProjects: () => currentOrg && loadProjects(currentOrg.id),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
