'use client';

import axios from 'axios';
import { auth } from '@/lib/firebase/config';

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        let url = process.env.NEXT_PUBLIC_API_URL;
        if (!url.endsWith('/api')) {
            url = url.endsWith('/') ? `${url}api` : `${url}/api`;
        }
        return url;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return 'https://backendcalyx.up.railway.app/api';
    }
    return 'http://localhost:4000/api';
};

const portalApi = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor: injeta token Firebase automaticamente
portalApi.interceptors.request.use(async (config) => {
    if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === Portal API Functions ===

export const fetchPatientProfile = async () => {
    const res = await portalApi.get('/portal/me');
    return res.data;
};

export const fetchPatientPrescriptions = async () => {
    const res = await portalApi.get('/portal/prescriptions');
    return res.data;
};

export const fetchPatientApplications = async () => {
    const res = await portalApi.get('/portal/applications');
    return res.data;
};

export const fetchPatientDocuments = async () => {
    const res = await portalApi.get('/portal/documents');
    return res.data;
};

export const fetchPatientAppointments = async () => {
    const res = await portalApi.get('/portal/appointments');
    return res.data;
};

export const fetchPatientTimeline = async () => {
    const res = await portalApi.get('/portal/timeline');
    return res.data;
};

export const fetchPatientExams = async () => {
    const res = await portalApi.get('/portal/exams');
    return res.data;
};

export const uploadPatientExam = async (file: File, title: string, description?: string, examDate?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (examDate) formData.append('examDate', examDate);

    const res = await portalApi.post('/portal/exams/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export default portalApi;
