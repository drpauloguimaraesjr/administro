'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Syringe, Clock, MapPin, User, CheckCircle2, AlertCircle, Pill, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// ─── TYPES ───
interface Appointment {
    id: string;
    patientName: string;
    date: string;
    startTime: string;
    endTime?: string;
    status: string;
    type: string;
}

interface Procedure {
    id: string;
    patientName: string;
    productName: string;
    dose: string;
    route: string;
    status: 'scheduled' | 'in_progress' | 'done';
    date: string;
    nurseAssigned?: string;
    consultorio?: string;
    arrivalTime?: string;
    lotNumber?: string;
}

// ─── MOCK DATA ───
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();
const d = (day: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const mockAppointments: Appointment[] = [
    // ── Day 3 (Mon) ──
    { id: 'a3_1', patientName: 'Luciana Ferreira', date: d(3), startTime: '08:00', endTime: '08:30', status: 'completed', type: 'return' },
    { id: 'a3_2', patientName: 'Marcos Pereira', date: d(3), startTime: '09:00', endTime: '09:45', status: 'completed', type: 'first_visit' },
    { id: 'a3_3', patientName: 'Beatriz Souza', date: d(3), startTime: '10:30', endTime: '11:00', status: 'completed', type: 'return' },
    // ── Day 4 (Tue) ──
    { id: 'a4_1', patientName: 'Ricardo Mendes', date: d(4), startTime: '08:30', endTime: '09:15', status: 'completed', type: 'first_visit' },
    { id: 'a4_2', patientName: 'Teresa Monteiro', date: d(4), startTime: '09:30', endTime: '10:00', status: 'completed', type: 'return' },
    { id: 'a4_3', patientName: 'Felipe Castro', date: d(4), startTime: '10:30', endTime: '11:15', status: 'completed', type: 'evaluation' },
    { id: 'a4_4', patientName: 'Isabela Cruz', date: d(4), startTime: '14:00', endTime: '14:30', status: 'completed', type: 'return' },
    { id: 'a4_5', patientName: 'Gabriel Nunes', date: d(4), startTime: '15:00', endTime: '15:30', status: 'completed', type: 'first_visit' },
    // ── Day 5 (Wed) ──
    { id: 'a5_1', patientName: 'Sandra Alves', date: d(5), startTime: '09:00', endTime: '09:30', status: 'completed', type: 'return' },
    { id: 'a5_2', patientName: 'Paulo Henrique', date: d(5), startTime: '10:00', endTime: '10:45', status: 'completed', type: 'procedure' },
    { id: 'a5_3', patientName: 'Amanda Rodrigues', date: d(5), startTime: '14:00', endTime: '14:30', status: 'completed', type: 'return' },
    { id: 'a5_4', patientName: 'Henrique Faria', date: d(5), startTime: '15:30', endTime: '16:15', status: 'completed', type: 'first_visit' },
    { id: 'a5_5', patientName: 'Cláudia Dias', date: d(5), startTime: '16:30', endTime: '17:00', status: 'completed', type: 'evaluation' },
    { id: 'a5_6', patientName: 'Roberto Lima', date: d(5), startTime: '17:30', endTime: '18:00', status: 'completed', type: 'return' },
    // ── Day 6 (Thu) ──
    { id: 'a6_1', patientName: 'Fernanda Lopes', date: d(6), startTime: '08:00', endTime: '08:30', status: 'completed', type: 'return' },
    { id: 'a6_2', patientName: 'Juliana Rocha', date: d(6), startTime: '09:00', endTime: '09:30', status: 'completed', type: 'first_visit' },
    // ── Day 7 (Fri) ──
    { id: 'a7_1', patientName: 'Carla Menezes', date: d(7), startTime: '09:00', endTime: '09:45', status: 'completed', type: 'evaluation' },
    { id: 'a7_2', patientName: 'Eduardo Costa', date: d(7), startTime: '10:00', endTime: '10:30', status: 'completed', type: 'return' },
    { id: 'a7_3', patientName: 'Maria Silva', date: d(7), startTime: '14:00', endTime: '14:30', status: 'completed', type: 'return' },
    { id: 'a7_4', patientName: 'João Santos', date: d(7), startTime: '15:00', endTime: '15:45', status: 'completed', type: 'first_visit' },
    // ── Today ──
    { id: 'at_1', patientName: 'Eduardo Costa', date: d(today.getDate()), startTime: '09:00', endTime: '09:45', status: 'confirmed', type: 'first_visit' },
    { id: 'at_2', patientName: 'Maria Silva', date: d(today.getDate()), startTime: '10:30', endTime: '11:00', status: 'pending', type: 'return' },
    { id: 'at_3', patientName: 'João Santos', date: d(today.getDate()), startTime: '14:00', endTime: '14:45', status: 'confirmed', type: 'procedure' },
    { id: 'at_4', patientName: 'Ana Oliveira', date: d(today.getDate()), startTime: '16:00', endTime: '16:30', status: 'confirmed', type: 'return' },
    { id: 'at_5', patientName: 'Carla Menezes', date: d(today.getDate()), startTime: '17:00', endTime: '17:45', status: 'pending', type: 'first_visit' },
    // ── Day 10 (Mon) ──
    { id: 'a10_1', patientName: 'Ricardo Mendes', date: d(10), startTime: '08:30', endTime: '09:15', status: 'confirmed', type: 'first_visit' },
    { id: 'a10_2', patientName: 'Luciana Ferreira', date: d(10), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'return' },
    { id: 'a10_3', patientName: 'Marcos Pereira', date: d(10), startTime: '11:00', endTime: '11:30', status: 'confirmed', type: 'return' },
    { id: 'a10_4', patientName: 'Teresa Monteiro', date: d(10), startTime: '14:00', endTime: '14:30', status: 'pending', type: 'evaluation' },
    { id: 'a10_5', patientName: 'Felipe Castro', date: d(10), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'return' },
    { id: 'a10_6', patientName: 'Gabriel Nunes', date: d(10), startTime: '16:00', endTime: '16:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a10_7', patientName: 'Isabela Cruz', date: d(10), startTime: '17:00', endTime: '17:30', status: 'confirmed', type: 'return' },
    // ── Day 11 (Tue) ──
    { id: 'a11_1', patientName: 'Sandra Alves', date: d(11), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'procedure' },
    { id: 'a11_2', patientName: 'Amanda Rodrigues', date: d(11), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'return' },
    { id: 'a11_3', patientName: 'Henrique Faria', date: d(11), startTime: '14:00', endTime: '14:45', status: 'confirmed', type: 'first_visit' },
    { id: 'a11_4', patientName: 'Cláudia Dias', date: d(11), startTime: '16:00', endTime: '16:30', status: 'pending', type: 'return' },
    // ── Day 12 (Wed) ──
    { id: 'a12_1', patientName: 'Roberto Lima', date: d(12), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'return' },
    { id: 'a12_2', patientName: 'Fernanda Lopes', date: d(12), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a12_3', patientName: 'Juliana Rocha', date: d(12), startTime: '10:30', endTime: '11:00', status: 'confirmed', type: 'return' },
    { id: 'a12_4', patientName: 'Carla Menezes', date: d(12), startTime: '14:00', endTime: '14:45', status: 'confirmed', type: 'evaluation' },
    { id: 'a12_5', patientName: 'Eduardo Costa', date: d(12), startTime: '15:30', endTime: '16:00', status: 'pending', type: 'first_visit' },
    { id: 'a12_6', patientName: 'Maria Silva', date: d(12), startTime: '16:30', endTime: '17:00', status: 'confirmed', type: 'return' },
    { id: 'a12_7', patientName: 'João Santos', date: d(12), startTime: '17:00', endTime: '17:30', status: 'confirmed', type: 'procedure' },
    { id: 'a12_8', patientName: 'Ana Oliveira', date: d(12), startTime: '17:30', endTime: '18:00', status: 'confirmed', type: 'return' },
    // ── Day 13 (Thu) ──
    { id: 'a13_1', patientName: 'Beatriz Souza', date: d(13), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a13_2', patientName: 'Ricardo Mendes', date: d(13), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'return' },
    { id: 'a13_3', patientName: 'Luciana Ferreira', date: d(13), startTime: '14:00', endTime: '14:30', status: 'pending', type: 'return' },
    // ── Day 14 (Fri) ──
    { id: 'a14_1', patientName: 'Marcos P.', date: d(14), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'return' },
    { id: 'a14_2', patientName: 'Teresa M.', date: d(14), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a14_3', patientName: 'Felipe Castro', date: d(14), startTime: '10:30', endTime: '11:00', status: 'confirmed', type: 'evaluation' },
    { id: 'a14_4', patientName: 'Isabela Cruz', date: d(14), startTime: '14:00', endTime: '14:30', status: 'confirmed', type: 'return' },
    { id: 'a14_5', patientName: 'Gabriel Nunes', date: d(14), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a14_6', patientName: 'Sandra Alves', date: d(14), startTime: '16:00', endTime: '16:30', status: 'pending', type: 'return' },
    // ── Day 17 (Mon) ──
    { id: 'a17_1', patientName: 'Amanda Rodrigues', date: d(17), startTime: '08:00', endTime: '08:45', status: 'confirmed', type: 'first_visit' },
    { id: 'a17_2', patientName: 'Roberto Lima', date: d(17), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'return' },
    { id: 'a17_3', patientName: 'Cláudia Dias', date: d(17), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'return' },
    { id: 'a17_4', patientName: 'Henrique Faria', date: d(17), startTime: '14:00', endTime: '14:45', status: 'pending', type: 'evaluation' },
    { id: 'a17_5', patientName: 'Fernanda Lopes', date: d(17), startTime: '15:30', endTime: '16:00', status: 'confirmed', type: 'return' },
    // ── Day 18 (Tue) - Full Day ──
    { id: 'a18_1', patientName: 'Ricardo Teixeira da Silva', date: d(18), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'return' },
    { id: 'a18_2', patientName: 'Laura Montenegro', date: d(18), startTime: '09:15', endTime: '10:00', status: 'pending', type: 'first_visit' },
    { id: 'a18_3', patientName: 'Carlos Eduardo Nogueira', date: d(18), startTime: '10:30', endTime: '11:15', status: 'completed', type: 'procedure' },
    { id: 'a18_4', patientName: 'Mariana Alves', date: d(18), startTime: '13:00', endTime: '13:30', status: 'cancelled', type: 'evaluation' },
    { id: 'a18_5', patientName: 'Dra. Beatriz Ferraz', date: d(18), startTime: '14:30', endTime: '15:15', status: 'confirmed', type: 'return' },
    { id: 'a18_6', patientName: 'Thiago Martins Carvalho', date: d(18), startTime: '16:00', endTime: '17:00', status: 'confirmed', type: 'first_visit' },
    { id: 'a18_7', patientName: 'Juliana Paes', date: d(18), startTime: '17:30', endTime: '18:15', status: 'pending', type: 'evaluation' },
    // ── Day 19 (Wed) ──
    { id: 'a19_1', patientName: 'Eduardo Costa', date: d(19), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'return' },
    { id: 'a19_2', patientName: 'Maria Silva', date: d(19), startTime: '09:30', endTime: '10:00', status: 'confirmed', type: 'return' },
    { id: 'a19_3', patientName: 'João Santos', date: d(19), startTime: '10:30', endTime: '11:15', status: 'confirmed', type: 'first_visit' },
    { id: 'a19_4', patientName: 'Carla Menezes', date: d(19), startTime: '14:00', endTime: '14:30', status: 'pending', type: 'return' },
    // ── Day 20 (Thu) ──
    { id: 'a20_1', patientName: 'Felipe Castro', date: d(20), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'return' },
    { id: 'a20_2', patientName: 'Teresa Monteiro', date: d(20), startTime: '11:00', endTime: '11:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a20_3', patientName: 'Gabriel Nunes', date: d(20), startTime: '14:00', endTime: '14:30', status: 'confirmed', type: 'return' },
    { id: 'a20_4', patientName: 'Isabela Cruz', date: d(20), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'evaluation' },
    { id: 'a20_5', patientName: 'Sandra Alves', date: d(20), startTime: '16:00', endTime: '16:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a20_6', patientName: 'Marcos Pereira', date: d(20), startTime: '17:00', endTime: '17:30', status: 'pending', type: 'return' },
    // ── Day 21 (Fri) ──
    { id: 'a21_1', patientName: 'Luciana Ferreira', date: d(21), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a21_2', patientName: 'Beatriz Souza', date: d(21), startTime: '09:30', endTime: '10:00', status: 'confirmed', type: 'return' },
    { id: 'a21_3', patientName: 'Ricardo Mendes', date: d(21), startTime: '10:30', endTime: '11:00', status: 'confirmed', type: 'return' },
    // ── Day 24 (Mon) ──
    { id: 'a24_1', patientName: 'Ana Oliveira', date: d(24), startTime: '08:00', endTime: '08:45', status: 'confirmed', type: 'first_visit' },
    { id: 'a24_2', patientName: 'Henrique Faria', date: d(24), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'return' },
    { id: 'a24_3', patientName: 'Amanda Rodrigues', date: d(24), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'evaluation' },
    { id: 'a24_4', patientName: 'Cláudia Dias', date: d(24), startTime: '14:00', endTime: '14:30', status: 'pending', type: 'return' },
    { id: 'a24_5', patientName: 'Roberto Lima', date: d(24), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a24_6', patientName: 'Fernanda Lopes', date: d(24), startTime: '16:00', endTime: '16:30', status: 'confirmed', type: 'return' },
    { id: 'a24_7', patientName: 'Juliana Rocha', date: d(24), startTime: '17:00', endTime: '17:30', status: 'confirmed', type: 'procedure' },
    // ── Day 25 (Tue) ──
    { id: 'a25_1', patientName: 'Isabela Cruz', date: d(25), startTime: '10:00', endTime: '10:45', status: 'confirmed', type: 'first_visit' },
    { id: 'a25_2', patientName: 'Gabriel Nunes', date: d(25), startTime: '14:00', endTime: '14:30', status: 'confirmed', type: 'return' },
    { id: 'a25_3', patientName: 'Teresa Monteiro', date: d(25), startTime: '15:30', endTime: '16:00', status: 'confirmed', type: 'return' },
    // ── Day 26 (Wed) ──
    { id: 'a26_1', patientName: 'Felipe Castro', date: d(26), startTime: '08:00', endTime: '08:30', status: 'confirmed', type: 'return' },
    { id: 'a26_2', patientName: 'Eduardo Costa', date: d(26), startTime: '09:00', endTime: '09:45', status: 'confirmed', type: 'first_visit' },
    { id: 'a26_3', patientName: 'Maria Silva', date: d(26), startTime: '10:30', endTime: '11:00', status: 'confirmed', type: 'evaluation' },
    { id: 'a26_4', patientName: 'Carla Menezes', date: d(26), startTime: '14:00', endTime: '14:30', status: 'pending', type: 'return' },
    { id: 'a26_5', patientName: 'Sandra Alves', date: d(26), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'first_visit' },
    // ── Day 27 (Thu) ──
    { id: 'a27_1', patientName: 'Marcos Pereira', date: d(27), startTime: '09:00', endTime: '09:30', status: 'confirmed', type: 'return' },
    { id: 'a27_2', patientName: 'Luciana Ferreira', date: d(27), startTime: '10:00', endTime: '10:30', status: 'confirmed', type: 'first_visit' },
    { id: 'a27_3', patientName: 'Beatriz Souza', date: d(27), startTime: '14:00', endTime: '14:30', status: 'confirmed', type: 'return' },
    { id: 'a27_4', patientName: 'Ricardo Mendes', date: d(27), startTime: '15:00', endTime: '15:30', status: 'confirmed', type: 'evaluation' },
];

const mockProcedures: Procedure[] = [
    // ── Today ──
    { id: 'pt_1', patientName: 'Fernanda Lopes', productName: 'Gestrinona 20mg', dose: '20mg', route: 'Implante SC', status: 'done', date: d(today.getDate()), nurseAssigned: 'Enfermeira Ana', consultorio: 'Sala 1', arrivalTime: '08:30', lotNumber: 'LOT-2025-0847' },
    { id: 'pt_2', patientName: 'Juliana Rocha', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'in_progress', date: d(today.getDate()), nurseAssigned: 'Enfermeira Ana', consultorio: 'Consultório Dr. Paulo', arrivalTime: '09:15', lotNumber: 'LOT-2025-1293' },
    { id: 'pt_3', patientName: 'João da Silveira', productName: 'Testosterona 75mg + Oxandrolona 10mg', dose: '85mg total', route: 'Implante SC', status: 'in_progress', date: d(today.getDate()), nurseAssigned: 'Enfermeira Carla', consultorio: 'Sala 2', arrivalTime: '09:40', lotNumber: 'LOT-2025-0991' },
    { id: 'pt_4', patientName: 'Patrícia Almeida', productName: 'Oxandrolona 15mg', dose: '15mg', route: 'Implante SC', status: 'scheduled', date: d(today.getDate()) },
    { id: 'pt_5', patientName: 'Roberto Lima', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'scheduled', date: d(today.getDate()) },
    { id: 'pt_6', patientName: 'Cláudia Dias', productName: 'Gestrinona 10mg + Testosterona 25mg', dose: '35mg total', route: 'Implante SC', status: 'scheduled', date: d(today.getDate()) },
    { id: 'pt_7', patientName: 'Marcos Pereira', productName: 'Testosterona 100mg', dose: '100mg', route: 'Implante Glúteo', status: 'scheduled', date: d(today.getDate()) },
    // ── Day 3 ──
    { id: 'p3_1', patientName: 'Luciana Ferreira', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'done', date: d(3) },
    // ── Day 5 ──
    { id: 'p5_1', patientName: 'Paulo Henrique', productName: 'Gestrinona 30mg', dose: '30mg', route: 'Implante SC', status: 'done', date: d(5) },
    { id: 'p5_2', patientName: 'Amanda Rodrigues', productName: 'Tirzepatida 2.5mg', dose: '2.5mg', route: 'Subcutânea', status: 'done', date: d(5) },
    // ── Day 7 ──
    { id: 'p7_1', patientName: 'João Santos', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'done', date: d(7) },
    { id: 'p7_2', patientName: 'Maria Silva', productName: 'Soroterapia Vitamina C', dose: '500ml', route: 'Intravenosa', status: 'done', date: d(7) },
    // ── Day 10 ──
    { id: 'p10_1', patientName: 'Sandra Alves', productName: 'Oxandrolona 10mg', dose: '10mg', route: 'Implante SC', status: 'scheduled', date: d(10) },
    { id: 'p10_2', patientName: 'Teresa Monteiro', productName: 'Tirzepatida 5mg', dose: '5mg', route: 'Subcutânea', status: 'scheduled', date: d(10) },
    { id: 'p10_3', patientName: 'Gabriel Nunes', productName: 'Testosterona 100mg', dose: '100mg', route: 'Implante Glúteo', status: 'scheduled', date: d(10) },
    // ── Day 12 ──
    { id: 'p12_1', patientName: 'Roberto Lima', productName: 'Gestrinona 20mg', dose: '20mg', route: 'Implante SC', status: 'scheduled', date: d(12) },
    { id: 'p12_2', patientName: 'Fernanda Lopes', productName: 'Soroterapia Complexo B + Zinco', dose: '250ml', route: 'Intravenosa', status: 'scheduled', date: d(12) },
    // ── Day 14 ──
    { id: 'p14_1', patientName: 'Teresa M.', productName: 'Testosterona 50mg + DHEA', dose: '60mg', route: 'Implante SC', status: 'scheduled', date: d(14) },
    { id: 'p14_2', patientName: 'Isabela Cruz', productName: 'Tirzepatida 5mg', dose: '5mg', route: 'Subcutânea', status: 'scheduled', date: d(14) },
    { id: 'p14_3', patientName: 'Gabriel Nunes', productName: 'Gestrinona 40mg', dose: '40mg', route: 'Implante Glúteo', status: 'scheduled', date: d(14) },
    { id: 'p14_4', patientName: 'Sandra Alves', productName: 'Soroterapia Vitamina C', dose: '500ml', route: 'Intravenosa', status: 'scheduled', date: d(14) },
    // ── Day 17 ──
    { id: 'p17_1', patientName: 'Amanda Rodrigues', productName: 'Tirzepatida 2.5mg', dose: '2.5mg', route: 'Subcutânea', status: 'scheduled', date: d(17) },
    { id: 'p17_2', patientName: 'Roberto Lima', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'scheduled', date: d(17) },
    // ── Day 18 - Rich Tirzepatida Day ──
    { id: 'p18_1', patientName: 'Ricardo Teixeira da Silva', productName: 'Tirzepatida 5mg (Mounjaro)', dose: '5mg', route: 'Subcutânea', status: 'done', date: d(18), nurseAssigned: 'Enf. Júlia', consultorio: 'Sala 1', arrivalTime: '08:15', lotNumber: 'MJ2024A002' },
    { id: 'p18_2', patientName: 'Carlos Eduardo Nogueira', productName: 'Testosterona 100mg + Anastrozol', dose: '100mg', route: 'Implante SC', status: 'in_progress', date: d(18), nurseAssigned: 'Enf. Clara', consultorio: 'Sala Botox', arrivalTime: '10:20', lotNumber: 'TST-84992-B' },
    { id: 'p18_3', patientName: 'Amanda Rodrigues', productName: 'Tirzepatida 2.5mg', dose: '2.5mg', route: 'Subcutânea', status: 'scheduled', date: d(18) },
    { id: 'p18_4', patientName: 'Juliana Paes', productName: 'Gestrinona 40mg', dose: '40mg', route: 'Implante Glúteo', status: 'scheduled', date: d(18) },
    { id: 'p18_5', patientName: 'Henrique Faria', productName: 'Soroterapia Vitamina C + Zinco', dose: '250ml', route: 'Intravenosa', status: 'scheduled', date: d(18) },
    // ── Day 20 ──
    { id: 'p20_1', patientName: 'Teresa Monteiro', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'scheduled', date: d(20) },
    { id: 'p20_2', patientName: 'Sandra Alves', productName: 'Tirzepatida 7.5mg', dose: '7.5mg', route: 'Subcutânea', status: 'scheduled', date: d(20) },
    { id: 'p20_3', patientName: 'Marcos Pereira', productName: 'Testosterona 100mg', dose: '100mg', route: 'Implante Glúteo', status: 'scheduled', date: d(20) },
    // ── Day 24 ──
    { id: 'p24_1', patientName: 'Ana Oliveira', productName: 'Gestrinona 30mg + DHEA', dose: '50mg', route: 'Implante SC', status: 'scheduled', date: d(24) },
    { id: 'p24_2', patientName: 'Cláudia Dias', productName: 'Tirzepatida 5mg', dose: '5mg', route: 'Subcutânea', status: 'scheduled', date: d(24) },
    { id: 'p24_3', patientName: 'Roberto Lima', productName: 'Soroterapia Vitamina C + B12', dose: '500ml', route: 'Intravenosa', status: 'scheduled', date: d(24) },
    { id: 'p24_4', patientName: 'Juliana Rocha', productName: 'Testosterona 75mg', dose: '75mg', route: 'Implante Glúteo', status: 'scheduled', date: d(24) },
    // ── Day 25 ──
    { id: 'p25_1', patientName: 'Isabela Cruz', productName: 'Testosterona 50mg', dose: '50mg', route: 'Implante SC', status: 'scheduled', date: d(25) },
    // ── Day 26 ──
    { id: 'p26_1', patientName: 'Eduardo Costa', productName: 'Tirzepatida 10mg', dose: '10mg', route: 'Subcutânea', status: 'scheduled', date: d(26) },
    { id: 'p26_2', patientName: 'Sandra Alves', productName: 'Gestrinona 20mg', dose: '20mg', route: 'Implante SC', status: 'scheduled', date: d(26) },
    // ── Day 27 ──
    { id: 'p27_1', patientName: 'Luciana Ferreira', productName: 'Testosterona 50mg + Pregnenolona', dose: '70mg', route: 'Implante SC', status: 'scheduled', date: d(27) },
    { id: 'p27_2', patientName: 'Beatriz Souza', productName: 'Soroterapia Vitamina C', dose: '500ml', route: 'Intravenosa', status: 'scheduled', date: d(27) },
    { id: 'p27_3', patientName: 'Ricardo Mendes', productName: 'Tirzepatida 7.5mg', dose: '7.5mg', route: 'Subcutânea', status: 'scheduled', date: d(27) },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const typeLabel: Record<string, string> = {
    first_visit: '1ª Consulta',
    return: 'Retorno',
    procedure: 'Procedimento',
    evaluation: 'Avaliação',
};

// ─── CONFIGURABLE TAGS (will come from settings later) ───
const SLOTS_PER_DAY = 8;

const APPOINTMENT_TAGS = {
    first_visit: { color: '#FF1493', label: '1ª Consulta' },       // hot pink
    return:      { color: '#8B5CF6', label: 'Retorno' },            // purple
    procedure:   { color: '#3B82F6', label: 'Procedimento' },       // blue
    evaluation:  { color: '#F59E0B', label: 'Avaliação' },          // amber
} as const;

const PROCEDURE_TAGS = {
    'Implante SC':      { color: '#06B6D4', label: 'Implante SC' },       // cyan
    'Implante Glúteo':  { color: '#8B5CF6', label: 'Implante Glúteo' },   // purple
    'Subcutânea':       { color: '#10B981', label: 'Subcutânea' },        // emerald
    'Intravenosa':      { color: '#F59E0B', label: 'Intravenosa' },       // amber
    default:            { color: '#6B7280', label: 'Procedimento' },      // gray
} as const;

// ─── HELPERS ───
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── PAGE ───
export default function AgendaPage() {
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Try API, fallback to mock
    const { data: apiAppts = [] } = useQuery({
        queryKey: ['agenda-appointments'],
        queryFn: async () => {
            try {
                const res = await api.get('/appointments');
                return res.data;
            } catch { return []; }
        },
    });

    const appointments = apiAppts.length > 0 ? apiAppts : mockAppointments;
    const procedures = mockProcedures;

    // Group by date
    const apptsByDate = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        appointments.forEach((a: Appointment) => {
            if (!map[a.date]) map[a.date] = [];
            map[a.date].push(a);
        });
        return map;
    }, [appointments]);

    const procsByDate = useMemo(() => {
        const map: Record<string, Procedure[]> = {};
        procedures.forEach((p: Procedure) => {
            if (!map[p.date]) map[p.date] = [];
            map[p.date].push(p);
        });
        return map;
    }, [procedures]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
        setSelectedDay(null);
    };
    const goToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        setSelectedDay(today.getDate());
    };

    const handleDayClick = (day: number) => {
        setSelectedDay(prev => prev === day ? null : day);
    };

    const selectedDateKey = selectedDay ? formatDateKey(currentYear, currentMonth, selectedDay) : null;
    const selectedAppts = selectedDateKey ? (apptsByDate[selectedDateKey] || []) : [];
    const selectedProcs = selectedDateKey ? (procsByDate[selectedDateKey] || []) : [];

    const isToday = (day: number) =>
        day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Find which row the selected day is in so we can insert the detail panel after that row
    const selectedRowIndex = selectedDay !== null ? Math.floor((firstDay + selectedDay - 1) / 7) : -1;

    // Build rows
    const rows: (number | null)[][] = [];
    let dayCounter = 1;
    const totalCells = firstDay + daysInMonth;
    const numRows = Math.ceil(totalCells / 7);
    for (let r = 0; r < numRows; r++) {
        const row: (number | null)[] = [];
        for (let c = 0; c < 7; c++) {
            const cellIndex = r * 7 + c;
            if (cellIndex < firstDay || dayCounter > daysInMonth) {
                row.push(null);
            } else {
                row.push(dayCounter);
                dayCounter++;
            }
        }
        rows.push(row);
    }

    return (
        <div className="space-y-0">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                    <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Agenda</h1>
                    <p className="font-mono text-sm text-muted-foreground">Visão mensal</p>
                </div>
            </div>

            {/* Calendar Nav */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={goToday} className="mono-label px-3 py-1.5 border border-border hover:border-foreground/40 transition-colors">
                        Hoje
                    </button>
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                    {MONTHS[currentMonth]} {currentYear}
                </h2>
            </div>

            {/* Calendar Grid */}
            <div className="border border-border bg-card">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-border">
                    {WEEKDAYS.map(wd => (
                        <div key={wd} className="mono-label text-muted-foreground text-center py-2.5 border-r border-border last:border-r-0">
                            {wd}
                        </div>
                    ))}
                </div>

                {/* Day Rows + Expandable Detail */}
                {rows.map((row, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                        <div className="grid grid-cols-7 border-b border-border last:border-b-0">
                            {row.map((day, cellIdx) => {
                                const dateKey = day ? formatDateKey(currentYear, currentMonth, day) : '';
                                const dayAppts = dateKey ? (apptsByDate[dateKey] || []) : [];
                                const dayProcs = dateKey ? (procsByDate[dateKey] || []) : [];
                                const isSelected = day === selectedDay;
                                const dayIsToday = day ? isToday(day) : false;

                                return (
                                    <button
                                        key={cellIdx}
                                        onClick={() => day && handleDayClick(day)}
                                        disabled={!day}
                                        className={`relative min-h-[90px] p-2 text-left border-r border-border last:border-r-0 transition-all duration-150 ${!day ? 'bg-muted/20' :
                                                isSelected ? 'bg-foreground/[0.06] border-foreground/30' :
                                                    dayIsToday ? 'bg-foreground/[0.03]' :
                                                        'hover:bg-muted/30'
                                            }`}
                                    >
                                        {day && (
                                            <>
                                                {/* Day number */}
                                                <span className={`font-mono text-sm font-medium ${isSelected ? 'text-foreground font-bold' :
                                                        dayIsToday ? 'text-foreground' :
                                                            'text-foreground'
                                                    }`}>
                                                    {day}
                                                </span>

                                                {/* Doctor name + slot circles */}
                                                {(dayAppts.length > 0 || dayProcs.length > 0) && (
                                                    <div className="mt-1.5 space-y-1">
                                                        {/* Doctor label */}
                                                        <p className="font-mono text-[7px] text-muted-foreground uppercase tracking-wider leading-none truncate">Dr. Paulo</p>

                                                        {/* Consultation slots (8 total) */}
                                                        <div className="flex gap-[3px] items-center">
                                                            {Array.from({ length: SLOTS_PER_DAY }).map((_, slotIdx) => {
                                                                const appt = dayAppts[slotIdx] as Appointment | undefined;
                                                                if (appt) {
                                                                    const tagColor = APPOINTMENT_TAGS[appt.type as keyof typeof APPOINTMENT_TAGS] || APPOINTMENT_TAGS.return;
                                                                    return (
                                                                        <div
                                                                            key={slotIdx}
                                                                            className="w-[6px] h-[6px] rounded-full shrink-0"
                                                                            style={{ backgroundColor: tagColor.color }}
                                                                            title={`${appt.startTime} - ${appt.patientName} (${tagColor.label})`}
                                                                        />
                                                                    );
                                                                }
                                                                return (
                                                                    <div
                                                                        key={slotIdx}
                                                                        className="w-[6px] h-[6px] rounded-full shrink-0 border border-border/60 bg-transparent"
                                                                        title="Horário livre"
                                                                    />
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Procedure dots (smaller) */}
                                                        {dayProcs.length > 0 && (
                                                            <div className="flex gap-[3px] items-center">
                                                                {dayProcs.map((p: Procedure, pIdx: number) => {
                                                                    const pTag = PROCEDURE_TAGS[p.route as keyof typeof PROCEDURE_TAGS] || PROCEDURE_TAGS.default;
                                                                    return (
                                                                        <div
                                                                            key={pIdx}
                                                                            className="w-[5px] h-[5px] rounded-sm shrink-0"
                                                                            style={{ backgroundColor: pTag.color }}
                                                                            title={`${p.patientName} - ${p.productName} (${pTag.label})`}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Empty day - just show ghost slots so user knows capacity */}
                                                {dayAppts.length === 0 && dayProcs.length === 0 && (
                                                    <div className="mt-1.5 space-y-1 opacity-30">
                                                        <p className="font-mono text-[7px] text-muted-foreground uppercase tracking-wider leading-none">Dr. Paulo</p>
                                                        <div className="flex gap-[3px] items-center">
                                                            {Array.from({ length: SLOTS_PER_DAY }).map((_, i) => (
                                                                <div key={i} className="w-[6px] h-[6px] rounded-full border border-border/40 bg-transparent shrink-0" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ─── EXPANDED DAY DETAIL ─── */}
                        <AnimatePresence>
                            {selectedDay !== null && selectedRowIndex === rowIdx && (
                                <motion.div
                                    key={`detail-${selectedDay}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="overflow-hidden border-b border-foreground/20 bg-foreground/[0.02]"
                                >
                                    <div className="p-6">
                                        {/* Detail Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-foreground text-white flex items-center justify-center font-mono text-lg font-bold">
                                                    {selectedDay}
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-lg font-bold text-foreground">
                                                        {new Date(currentYear, currentMonth, selectedDay!).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                                    </h3>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {selectedAppts.length} consultas • {selectedProcs.length} procedimentos
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedDay(null)}
                                                className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Split Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* LEFT: Consultas */}
                                            <div className="border border-border glass-card-solid p-5">
                                                <h4 className="font-serif text-base font-bold text-foreground flex items-center gap-2 mb-4">
                                                    <Calendar className="w-4 h-4 text-foreground" />
                                                    Consultas
                                                </h4>
                                                {selectedAppts.length === 0 ? (
                                                    <p className="font-mono text-xs text-muted-foreground text-center py-6">Nenhuma consulta neste dia</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {selectedAppts.sort((a: Appointment, b: Appointment) => a.startTime.localeCompare(b.startTime)).map((apt: Appointment) => (
                                                            <div
                                                                key={apt.id}
                                                                className="flex items-center justify-between p-3 border border-border hover:border-foreground/30 transition-colors group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="font-mono text-sm font-medium text-foreground min-w-[50px]">
                                                                        {apt.startTime}
                                                                    </div>
                                                                    <div className="h-6 w-px bg-border" />
                                                                    <div>
                                                                        <p className="font-serif font-semibold text-foreground text-sm group-hover:text-foreground transition-colors">
                                                                            {apt.patientName}
                                                                        </p>
                                                                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                                                                            {typeLabel[apt.type] || apt.type}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className={`font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border ${apt.status === 'confirmed' ? 'border-foreground/30 text-foreground/80' :
                                                                        apt.status === 'pending' ? 'border-warning/30 text-warning' :
                                                                            apt.status === 'completed' ? 'border-border text-muted-foreground' :
                                                                                'border-destructive/30 text-destructive'
                                                                    }`}>
                                                                    {apt.status === 'confirmed' ? 'Confirmado' :
                                                                        apt.status === 'pending' ? 'Pendente' :
                                                                            apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* RIGHT: Procedimentos */}
                                            <div className="border border-border glass-card-solid p-5">
                                                <h4 className="font-serif text-base font-bold text-foreground flex items-center gap-2 mb-4">
                                                    <Syringe className="w-4 h-4 text-foreground" />
                                                    Procedimentos
                                                </h4>

                                                {selectedProcs.length === 0 ? (
                                                    <p className="font-mono text-xs text-muted-foreground text-center py-6">Nenhum procedimento neste dia</p>
                                                ) : (
                                                    <>
                                                        {/* Em Atendimento */}
                                                        {selectedProcs.filter(p => p.status === 'in_progress' || p.status === 'done').length > 0 && (
                                                            <div className="mb-4">
                                                                <p className="mono-label text-foreground mb-2 flex items-center gap-1.5">
                                                                    <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                                                                    Na Clínica
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {selectedProcs.filter(p => p.status === 'in_progress' || p.status === 'done').map(app => (
                                                                        <div key={app.id} className="group relative">
                                                                            <div className={`p-3 border transition-all cursor-default ${app.status === 'done'
                                                                                    ? 'border-foreground/30 bg-foreground/[0.04]'
                                                                                    : 'border-warning/30 bg-warning/[0.04]'
                                                                                }`}>
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <div className={`w-5 h-5 flex items-center justify-center ${app.status === 'done' ? 'text-foreground' : 'text-warning'}`}>
                                                                                        {app.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                                                    </div>
                                                                                    <span className={`font-mono text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 border ${app.status === 'done' ? 'border-foreground/30 text-foreground/80' : 'border-warning/30 text-warning'
                                                                                        }`}>
                                                                                        {app.status === 'done' ? 'Feita' : 'Atendendo'}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="font-serif font-semibold text-foreground text-xs truncate">{app.patientName}</p>
                                                                                <p className="font-mono text-[9px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                                                                                {app.consultorio && (
                                                                                    <p className="font-mono text-[9px] text-foreground mt-1.5 flex items-center gap-1">
                                                                                        <MapPin className="w-2.5 h-2.5" /> {app.consultorio}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            {/* Hover tooltip */}
                                                                            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-foreground text-background p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl">
                                                                                <p className="font-serif font-bold text-xs mb-1.5">{app.patientName}</p>
                                                                                <div className="space-y-1 font-mono text-[9px]">
                                                                                    <div className="flex items-center gap-1.5"><Pill className="w-2.5 h-2.5 opacity-60" /> {app.productName}</div>
                                                                                    <div className="flex items-center gap-1.5"><Syringe className="w-2.5 h-2.5 opacity-60" /> {app.dose} • {app.route}</div>
                                                                                    {app.nurseAssigned && <div className="flex items-center gap-1.5"><User className="w-2.5 h-2.5 opacity-60" /> {app.nurseAssigned}</div>}
                                                                                    {app.arrivalTime && <div className="flex items-center gap-1.5"><Clock className="w-2.5 h-2.5 opacity-60" /> Chegou às {app.arrivalTime}</div>}
                                                                                    {app.lotNumber && <div className="opacity-50 mt-0.5">Lote: {app.lotNumber}</div>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Agendados */}
                                                        {selectedProcs.filter(p => p.status === 'scheduled').length > 0 && (
                                                            <div>
                                                                <p className="mono-label text-muted-foreground mb-2 flex items-center gap-1.5">
                                                                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                                                    Agendados
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {selectedProcs.filter(p => p.status === 'scheduled').map(app => (
                                                                        <div key={app.id} className="group relative">
                                                                            <div className="p-3 border border-border hover:border-foreground/30 transition-all cursor-default">
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <Syringe className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                                                    <span className="font-mono text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 border border-border text-muted-foreground">Agendada</span>
                                                                                </div>
                                                                                <p className="font-serif font-semibold text-foreground text-xs truncate">{app.patientName}</p>
                                                                                <p className="font-mono text-[9px] text-muted-foreground mt-0.5 truncate">{app.productName}</p>
                                                                            </div>
                                                                            {/* Hover tooltip */}
                                                                            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-foreground text-background p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-xl">
                                                                                <p className="font-serif font-bold text-xs mb-1.5">{app.patientName}</p>
                                                                                <div className="space-y-1 font-mono text-[9px]">
                                                                                    <div className="flex items-center gap-1.5"><Pill className="w-2.5 h-2.5 opacity-60" /> {app.productName}</div>
                                                                                    <div className="flex items-center gap-1.5"><Syringe className="w-2.5 h-2.5 opacity-60" /> {app.dose} • {app.route}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
