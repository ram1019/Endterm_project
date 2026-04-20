import { useState, useEffect, useCallback } from 'react';
import { supabase, isMocked } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useData = (tableName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    if (isMocked) {
      const localData = localStorage.getItem(`mock_${tableName}_${user.id}`);
      setData(localData ? JSON.parse(localData) : []);
      setLoading(false);
      return;
    }

    const { data: result, error: dbError } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', user.id);

    if (dbError) {
      setError(dbError.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
  }, [tableName, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRecord = async (newRecord) => {
    const recordWithUser = { ...newRecord, user_id: user.id, id: Date.now().toString(), created_at: new Date().toISOString() };
    
    if (isMocked) {
      const updatedData = [...data, recordWithUser];
      localStorage.setItem(`mock_${tableName}_${user.id}`, JSON.stringify(updatedData));
      setData(updatedData);
      return { data: recordWithUser, error: null };
    }

    const { data: insertedData, error: dbError } = await supabase
      .from(tableName)
      .insert([recordWithUser])
      .select()
      .single();

    if (!dbError) {
      setData([...data, insertedData]);
    }
    return { data: insertedData, error: dbError };
  };

  const updateRecord = async (id, updates) => {
    if (isMocked) {
      const updatedData = data.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem(`mock_${tableName}_${user.id}`, JSON.stringify(updatedData));
      setData(updatedData);
      return { data: updates, error: null };
    }

    const { data: updatedDataDB, error: dbError } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!dbError) {
      setData(data.map(item => item.id === id ? updatedDataDB : item));
    }
    return { data: updatedDataDB, error: dbError };
  };

  const deleteRecord = async (id) => {
    if (isMocked) {
      const updatedData = data.filter(item => item.id !== id);
      localStorage.setItem(`mock_${tableName}_${user.id}`, JSON.stringify(updatedData));
      setData(updatedData);
      return { error: null };
    }

    const { error: dbError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!dbError) {
      setData(data.filter(item => item.id !== id));
    }
    return { error: dbError };
  };

  return { data, loading, error, addRecord, updateRecord, deleteRecord, refetch: fetchData };
};
