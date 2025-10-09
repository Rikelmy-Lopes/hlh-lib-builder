use std::sync::{Arc, Mutex, MutexGuard};

/// Cria um novo `Arc<Mutex<T>>` a partir de um valor qualquer.
/// Útil para inicializar valores que serão compartilhados entre threads.
pub fn new_arc_mutex<T>(value: T) -> Arc<Mutex<T>> {
    Arc::new(Mutex::new(value))
}

/// Lê uma **cópia** do valor dentro de um `Arc<Mutex<T>>`.
/// Não permite modificar o valor original, apenas retorna uma cópia.
pub fn read_arc_mutex<T: Clone>(data: &Arc<Mutex<T>>) -> T {
    let lock = data.lock().expect("Failed to lock mutex");
    lock.clone()
}

/// Retorna o `MutexGuard<T>` de um `Arc<Mutex<T>>`.
/// Permite ler e modificar diretamente o valor original enquanto o guard estiver em escopo.
/// O lock é liberado automaticamente quando o guard é descartado.
pub fn lock_arc_mutex<'a, T>(data: &'a Arc<Mutex<T>>) -> MutexGuard<'a, T> {
    data.lock().unwrap()
}
