import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Optimized state hook with debouncing
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return [debouncedValue, setValue, value];
};

// Throttled state hook
export const useThrottledState = (initialValue, limit = 100) => {
  const [value, setValue] = useState(initialValue);
  const [throttledValue, setThrottledValue] = useState(initialValue);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return [throttledValue, setValue, value];
};

// Optimized array state with memoized operations
export const useOptimizedArray = (initialArray = []) => {
  const [array, setArray] = useState(initialArray);
  
  const operations = useMemo(() => ({
    add: (item) => {
      setArray(prev => [...prev, item]);
    },
    
    addMultiple: (items) => {
      setArray(prev => [...prev, ...items]);
    },
    
    remove: (index) => {
      setArray(prev => prev.filter((_, i) => i !== index));
    },
    
    removeById: (id, idKey = 'id') => {
      setArray(prev => prev.filter(item => item[idKey] !== id));
    },
    
    update: (index, newItem) => {
      setArray(prev => prev.map((item, i) => i === index ? newItem : item));
    },
    
    updateById: (id, updates, idKey = 'id') => {
      setArray(prev => prev.map(item => 
        item[idKey] === id ? { ...item, ...updates } : item
      ));
    },
    
    clear: () => {
      setArray([]);
    },
    
    sort: (compareFn) => {
      setArray(prev => [...prev].sort(compareFn));
    },
    
    filter: (predicate) => {
      setArray(prev => prev.filter(predicate));
    },
    
    move: (fromIndex, toIndex) => {
      setArray(prev => {
        const newArray = [...prev];
        const [removed] = newArray.splice(fromIndex, 1);
        newArray.splice(toIndex, 0, removed);
        return newArray;
      });
    }
  }), []);
  
  const memoizedArray = useMemo(() => array, [array]);
  
  return [memoizedArray, operations];
};

// Optimized object state with deep updates
export const useOptimizedObject = (initialObject = {}) => {
  const [object, setObject] = useState(initialObject);
  
  const operations = useMemo(() => ({
    update: (updates) => {
      setObject(prev => ({ ...prev, ...updates }));
    },
    
    updateNested: (path, value) => {
      setObject(prev => {
        const keys = path.split('.');
        const newObject = { ...prev };
        let current = newObject;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          current[key] = { ...current[key] };
          current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        return newObject;
      });
    },
    
    remove: (key) => {
      setObject(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    },
    
    removeNested: (path) => {
      setObject(prev => {
        const keys = path.split('.');
        const newObject = { ...prev };
        let current = newObject;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          current[key] = { ...current[key] };
          current = current[key];
        }
        
        delete current[keys[keys.length - 1]];
        return newObject;
      });
    },
    
    reset: () => {
      setObject(initialObject);
    },
    
    merge: (newObject) => {
      setObject(prev => {
        const merge = (target, source) => {
          const result = { ...target };
          for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              result[key] = merge(target[key] || {}, source[key]);
            } else {
              result[key] = source[key];
            }
          }
          return result;
        };
        return merge(prev, newObject);
      });
    }
  }), [initialObject]);
  
  const memoizedObject = useMemo(() => object, [object]);
  
  return [memoizedObject, operations];
};

// Optimized form state hook
export const useOptimizedForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!rule) return null;
    
    if (typeof rule === 'function') {
      return rule(value, values);
    }
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${fieldName} is required`;
    }
    
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }
    
    return null;
  }, [validationRules, values]);
  
  const operations = useMemo(() => ({
    setValue: (name, value) => {
      setValues(prev => ({ ...prev, [name]: value }));
      
      // Validate on change
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    
    setValues: (newValues) => {
      setValues(newValues);
    },
    
    setTouched: (name, isTouched = true) => {
      setTouched(prev => ({ ...prev, [name]: isTouched }));
    },
    
    setError: (name, error) => {
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    
    clearError: (name) => {
      setErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    },
    
    validateAll: () => {
      const newErrors = {};
      let isValid = true;
      
      Object.keys(validationRules).forEach(fieldName => {
        const error = validate(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });
      
      setErrors(newErrors);
      return isValid;
    },
    
    reset: () => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    
    handleSubmit: (onSubmit) => async (e) => {
      e?.preventDefault();
      
      setIsSubmitting(true);
      
      // Mark all fields as touched
      const allTouched = {};
      Object.keys(validationRules).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      
      // Validate all fields
      const isValid = operations.validateAll();
      
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setIsSubmitting(false);
    }
  }), [validate, values, validationRules, initialValues]);
  
  const formState = useMemo(() => ({
    values,
    errors,
    touched,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues)
  }), [values, errors, touched, isSubmitting, initialValues]);
  
  return [formState, operations];
};

// Optimized pagination hook
export const useOptimizedPagination = (totalItems, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      isFirst: currentPage === 1,
      isLast: currentPage === totalPages
    };
  }, [currentPage, totalItems, itemsPerPage]);
  
  const operations = useMemo(() => ({
    goToPage: (page) => {
      const validPage = Math.max(1, Math.min(page, paginationData.totalPages));
      setCurrentPage(validPage);
    },
    
    nextPage: () => {
      if (paginationData.hasNext) {
        setCurrentPage(prev => prev + 1);
      }
    },
    
    prevPage: () => {
      if (paginationData.hasPrev) {
        setCurrentPage(prev => prev - 1);
      }
    },
    
    firstPage: () => {
      setCurrentPage(1);
    },
    
    lastPage: () => {
      setCurrentPage(paginationData.totalPages);
    },
    
    reset: () => {
      setCurrentPage(1);
    }
  }), [paginationData]);
  
  return [paginationData, operations];
};

// Optimized search hook with debouncing
export const useOptimizedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);
  
  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await searchFn(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFn]);
  
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      search(query);
    }, delay);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, search, delay]);
  
  const operations = useMemo(() => ({
    setQuery,
    clearSearch: () => {
      setQuery('');
      setResults([]);
      setError(null);
    },
    searchNow: () => search(query)
  }), [search, query]);
  
  return {
    query,
    results,
    isSearching,
    error,
    ...operations
  };
};

export default {
  useDebouncedState,
  useThrottledState,
  useOptimizedArray,
  useOptimizedObject,
  useOptimizedForm,
  useOptimizedPagination,
  useOptimizedSearch
};