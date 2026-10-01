# Retirar ARKA-Lite del Kubernetes local

Desde la raíz del repositorio, compruebe primero el contexto:

```powershell
kubectl config current-context
```

Debe ser `docker-desktop`. Cierre con Ctrl+C las terminales donde ejecutó `kubectl port-forward`. Retire **solo los recursos definidos en `k8s/`**:

```powershell
kubectl delete -f k8s/ --ignore-not-found
kubectl get deployments,pods,services
```

Es normal que sigan apareciendo servicios del sistema como `kubernetes`. Este paso no borra el clúster, otros proyectos ni las imágenes de Docker. Para liberar espacio, revise primero `docker image ls`; elimine solo las etiquetas de ARKA-Lite que ya no use mediante `docker image rm NOMBRE:ETIQUETA`. Evite limpiezas globales del equipo como parte de este procedimiento.
