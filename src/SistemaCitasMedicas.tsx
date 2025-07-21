import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Save, Plus, X, Check, UserCheck, Eye, Edit2 } from 'lucide-react';

const SistemaCoordinacionMedica = () => {
  // Estados principales
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear] = useState(2025);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [scheduledShifts, setScheduledShifts] = useState({});
  const [viewDate, setViewDate] = useState(null);

  // Datos de médicos
  const doctors = [
    { id: 1, name: 'VILLARREAL GIRALDO ANGEL EDUARDO', specialty: 'CARDIOLOGIA', dni: '46451440' },
    { id: 2, name: 'NIZAMA RAYMUNDO LUIS GEANFRANCO', specialty: 'CARDIOLOGIA', dni: '71101955' },
    { id: 3, name: 'ZAVALETA CAMACHO GABRIELA', specialty: 'CARDIOLOGIA', dni: '73613444' },
    { id: 4, name: 'REVOLLAR RAMIREZ, YOYCE ROSARIO', specialty: 'DERMATOLOGIA', dni: '10122974' },
    { id: 5, name: 'AYALA NUNURA DEYVI RONALD', specialty: 'ENDOCRINOLOGIA', dni: '46924731' },
    { id: 6, name: 'GÁLVEZ GASTELÚ, ANDREA LUCIA', specialty: 'ENDOCRINOLOGIA', dni: '46205941' },
    { id: 7, name: 'PÉREZ DOMINGUEZ, ROSAURA ELENA', specialty: 'ENDOCRINOLOGIA', dni: '43888440' },
    { id: 8, name: 'FLORES ASENJO WALTER ALBERTO', specialty: 'GASTROENTEROLOGIA', dni: '12345678' },
    { id: 9, name: 'MARTINEZ LOPEZ CARMEN SOFIA', specialty: 'PEDIATRIA', dni: '87654321' },
    { id: 10, name: 'RODRIGUEZ VARGAS MIGUEL ANGEL', specialty: 'PEDIATRIA', dni: '11223344' }
  ];

  // Generar opciones de tiempo cada 30 minutos
  const generateTimecupos = () => {
    const cupos = [];
    for (let hour = 6; hour <= 22; hour++) {
      cupos.push(`${hour.toString().padStart(2, '0')}:00`);
      cupos.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return cupos;
  };

  // Generar cupos de citas basado en el rango de tiempo
  const generateAppointmentcupos = (startTime, endTime, duration) => {
    const cupos = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      cupos.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    
    return cupos;
  };

  // Obtener turnos para un médico y fecha específica
  const getShiftsForDate = (doctorId, date) => {
    const key = `${doctorId}_${date}`;
    return scheduledShifts[key] || [];
  };

  // Verificar si un día tiene turnos programados
  const hasScheduledShifts = (doctorId, day) => {
    const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return getShiftsForDate(doctorId, date).length > 0;
  };

  // Manejar la programación de turnos
  const handleScheduleShifts = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime || !selectedDoctor) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (selectedStartTime >= selectedEndTime) {
      alert('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    const appointmentcupos = generateAppointmentcupos(selectedStartTime, selectedEndTime, appointmentDuration);
    
    const key = `${selectedDoctor}_${selectedDate}`;
    setScheduledShifts(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), {
        id: Date.now(),
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: appointmentDuration,
        cupos: appointmentcupos,
        createdAt: new Date().toISOString()
      }]
    }));

    // Limpiar formulario
    setShowModal(false);
    setSelectedDate(null);
    setSelectedStartTime('');
    setSelectedEndTime('');
    
    alert(`Turno programado exitosamente con ${appointmentcupos.length} cupos de ${appointmentDuration} minutos`);
  };

  // Eliminar un turno específico
  const removeShift = (doctorId, date, shiftId) => {
    const key = `${doctorId}_${date}`;
    setScheduledShifts(prev => ({
      ...prev,
      [key]: prev[key].filter(shift => shift.id !== shiftId)
    }));
  };

  // Renderizar calendario del mes
  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    
    const calendar = [];
    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Espacios vacíos para el primer día del mes
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const hasShifts = selectedDoctor && hasScheduledShifts(parseInt(selectedDoctor), day);
      const shifts = selectedDoctor ? getShiftsForDate(parseInt(selectedDoctor), date) : [];
      const totalcupos = shifts.reduce((total, shift) => total + shift.cupos.length, 0);
      
      calendar.push(
        <div
          key={day}
          className={`p-2 text-center cursor-pointer border rounded-lg transition-all duration-200 min-h-[80px] flex flex-col justify-between ${
            hasShifts 
              ? 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 shadow-sm' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
          }`}
          onClick={() => {
            if (selectedDoctor) {
              setSelectedDate(date);
              setShowModal(true);
            }
          }}
        >
          <div className="text-sm font-medium">{day}</div>
          {hasShifts && (
            <div className="space-y-1">
              <div className="text-xs bg-blue-200 rounded px-1 py-0.5">
                {shifts.length} turno{shifts.length > 1 ? 's' : ''}
              </div>
              <div className="text-xs font-medium text-blue-700">
                {totalcupos} cupos
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewDate(date);
                  setShowViewModal(true);
                }}
                className="flex items-center gap-1 px-2 py-1 mx-auto text-xs text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
              >
                <Eye className="w-3 h-3" />
                Ver
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{monthNames[selectedMonth]} {selectedYear}</h3>
          <div className="flex items-center gap-3">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={8}>Agosto</option>
              <option value={9}>Septiembre</option>
              <option value={10}>Octubre</option>
              <option value={11}>Noviembre</option>
              <option value={12}>Diciembre</option>
            </select>
          </div>
        </div>
        
        {!selectedDoctor && (
          <div className="py-12 text-center text-gray-500 rounded-lg bg-gray-50">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Seleccione un médico para programar turnos</p>
            <p className="mt-2 text-sm">Una vez seleccionado, podrá hacer clic en cualquier día para programar turnos</p>
          </div>
        )}
        
        {selectedDoctor && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-3 text-sm font-semibold text-center text-gray-700 bg-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {calendar}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-200 rounded bg-gray-50"></div>
                <span>Sin turnos programados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Con turnos programados</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const timecupos = generateTimecupos();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Coordinación Médica</h1>
              <p className="mt-1 text-gray-600">Gestión y programación de turnos médicos - Período: Agosto a Diciembre 2025</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Panel de Control */}
          <div className="space-y-6 lg:col-span-1">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900">
                <UserCheck className="w-5 h-5" />
                Selección de Médico
              </h2>
              
              <div className="mb-6">
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Médico
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar médico...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr(a). {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Información del médico seleccionado */}
              {selectedDoctor && (
                <div className="p-4 rounded-lg bg-blue-50">
                  <h4 className="mb-3 font-semibold text-blue-900">Información del Médico</h4>
                  {(() => {
                    const doctor = doctors.find(d => d.id === parseInt(selectedDoctor));
                    return doctor ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-blue-800">Nombre:</span> <span className="text-blue-700">Dr(a). {doctor.name}</span></p>
                        <p><span className="font-medium text-blue-800">Especialidad:</span> <span className="text-blue-700">{doctor.specialty}</span></p>
                        <p><span className="font-medium text-blue-800">DNI:</span> <span className="text-blue-700">{doctor.dni}</span></p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Estadísticas rápidas */}
            {selectedDoctor && (
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Estadísticas del Mes</h3>
                {(() => {
                  const doctorShifts = Object.entries(scheduledShifts)
                    .filter(([key]) => key.startsWith(`${selectedDoctor}_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`))
                    .reduce((total, [, shifts]) => total + shifts.length, 0);
                  
                  const totalcupos = Object.entries(scheduledShifts)
                    .filter(([key]) => key.startsWith(`${selectedDoctor}_${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`))
                    .reduce((total, [, shifts]) => {
                      return total + shifts.reduce((shiftTotal, shift) => shiftTotal + shift.cupos.length, 0);
                    }, 0);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                        <span className="text-sm font-medium text-green-800">Turnos programados:</span>
                        <span className="text-lg font-bold text-green-600">{doctorShifts}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                        <span className="text-sm font-medium text-blue-800">Total de cupos:</span>
                        <span className="text-lg font-bold text-blue-600">{totalcupos}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Calendario */}
          <div className="lg:col-span-3">
            {renderCalendar()}
          </div>
        </div>

        {/* Modal para programar turno */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Plus className="w-6 h-6" />
                  Programar Nuevo Turno
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Fecha seleccionada
                  </label>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-lg font-semibold text-blue-900">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Hora de inicio
                    </label>
                    <select
                      value={selectedStartTime}
                      onChange={(e) => setSelectedStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {timecupos.map(slot => (
                        <option key={`start-${slot}`} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Hora de fin
                    </label>
                    <select
                      value={selectedEndTime}
                      onChange={(e) => setSelectedEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {timecupos.map(slot => (
                        <option key={`end-${slot}`} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Duración por cita (minutos)
                  </label>
                  <select
                    value={appointmentDuration}
                    onChange={(e) => setAppointmentDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                {selectedStartTime && selectedEndTime && selectedStartTime < selectedEndTime && (
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="mb-2 text-sm font-medium text-green-800">Resumen del turno:</p>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>• Horario: {selectedStartTime} - {selectedEndTime}</p>
                      <p>• Duración por cita: {appointmentDuration} minutos</p>
                      <p>• Cantidad de cupos: {generateAppointmentcupos(selectedStartTime, selectedEndTime, appointmentDuration).length}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleScheduleShifts}
                  disabled={!selectedStartTime || !selectedEndTime || selectedStartTime >= selectedEndTime}
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Guardar Turno
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver turnos del día */}
        {showViewModal && viewDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Eye className="w-6 h-6" />
                  Turnos del día
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(viewDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {(() => {
                const shifts = getShiftsForDate(parseInt(selectedDoctor), viewDate);
                
                if (shifts.length === 0) {
                  return (
                    <div className="py-8 text-center text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No hay turnos programados para esta fecha</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="p-4 rounded-lg bg-blue-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-blue-900">
                              Turno: {shift.startTime} - {shift.endTime}
                            </h4>
                            <p className="text-sm text-blue-700">
                              Duración por cita: {shift.duration} minutos | {shift.cupos.length} cupos disponibles
                            </p>
                          </div>
                          <button
                            onClick={() => removeShift(parseInt(selectedDoctor), viewDate, shift.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {shift.cupos.map((slot, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 text-sm text-center text-blue-800 bg-white border border-blue-200 rounded"
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaCoordinacionMedica;