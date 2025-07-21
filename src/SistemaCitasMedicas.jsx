import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, UserCheck, Plus } from 'lucide-react';

const specialties = ['Medicina General', 'Pediatría', 'Ginecología', 'Cardiología'];

const doctors = [
  {
    id: '1',
    name: 'Dra. Ana Morales',
    specialty: 'Medicina General',
    schedule: {
      lunes: '08:00-12:00',
      martes: '08:00-12:00',
      miercoles: '08:00-12:00',
      jueves: '08:00-12:00',
      viernes: '08:00-12:00',
    },
  },
  {
    id: '2',
    name: 'Dr. Juan Pérez',
    specialty: 'Cardiología',
    schedule: {
      lunes: '14:00-18:00',
      miercoles: '14:00-18:00',
      viernes: '14:00-18:00',
    },
  },
];

const SistemaCitasMedicas = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const selectedMonth = 7;// Julio
  const [selectedYear] = useState(2025);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const availableDays = useMemo(() => {
    if (!selectedDoctor) return [];
    const doctorSchedule = doctors.find(d => d.id === selectedDoctor)?.schedule;
    if (!doctorSchedule) return [];

    const validDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const weekday = date
        .toLocaleDateString('es-PE', { weekday: 'long' })
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      if (doctorSchedule[weekday]) {
        validDays.push({
          day,
          date: date.toISOString().split('T')[0],
          weekday,
        });
      }
    }

    return validDays;
  }, [selectedDoctor, selectedMonth, selectedYear]);

  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return [];

    const weekday = new Date(selectedDate)
      .toLocaleDateString('es-PE', { weekday: 'long' })
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const range = doctor.schedule[weekday];
    if (!range) return [];

    const [start, end] = range.split('-');
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }

    return slots;
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedSpecialty) {
      const result = doctors.filter(d => d.specialty === selectedSpecialty);
      setFilteredDoctors(result);
      setSelectedDoctor(null);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty]);

  const handleConfirmAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const doctor = doctors.find(d => d.id === selectedDoctor);
    const newAppointment = {
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: selectedDate,
      time: selectedTime,
    };

    setAppointments([...appointments, newAppointment]);
    setShowModal(false);
    setSelectedDate('');
    setSelectedTime('');
  };

  return (
    <div className="max-w-4xl p-6 mx-auto text-gray-800">
      <h1 className="mb-4 text-3xl font-bold">Sistema de Citas Médicas</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-medium">Especialidad</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Seleccione</option>
            {specialties.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Médico</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedDoctor || ''}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!filteredDoctors.length}
          >
            <option value="">Seleccione</option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendario */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 mb-2 text-xl font-semibold">
          <Calendar className="w-5 h-5" /> Días Disponibles
        </h2>
       <div className="grid grid-cols-7 gap-2">
  {Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(selectedYear, selectedMonth, day);
    const iso = date.toISOString().split('T')[0];

    const weekdayName = date
      .toLocaleDateString('es-PE', { weekday: 'long' })
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const isAvailable = availableDays.some(d => d.day === day);

    return (
      <button
        key={day}
        className={`p-2 border rounded text-sm ${
          selectedDate === iso
            ? 'bg-blue-600 text-white'
            : isAvailable
            ? 'hover:bg-blue-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        onClick={() => isAvailable && setSelectedDate(iso)}
        disabled={!isAvailable}
      >
        <div className="text-xs text-gray-500">{weekdayName.slice(0, 3)}</div>
        {day}
      </button>
    );
  })}
</div>

      </div>

      {/* Horarios */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 mb-2 text-xl font-semibold">
            <Clock className="w-5 h-5" /> Horarios Disponibles
          </h2>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  setShowModal(true);
                }}
                className="px-4 py-2 font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Citas agendadas */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 mb-2 text-xl font-semibold">
          <UserCheck className="w-5 h-5" /> Citas Agendadas
        </h2>
        <ul className="pl-5 list-disc">
          {appointments.map((a, index) => (
            <li key={index}>
              {a.date} - {a.time} con <strong>{a.doctor}</strong> ({a.specialty})
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="max-w-full p-6 bg-white rounded-lg shadow-lg w-96">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <Plus className="w-5 h-5" /> Confirmar Cita
            </h3>
            <p className="mb-2">
              ¿Desea confirmar la cita el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAppointment}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaCitasMedicas;
